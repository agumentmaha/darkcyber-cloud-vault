import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

/**
 * Ensures a Telegram user has an auth account + profile.
 * Returns the profile id or null on failure.
 */
async function ensureUser(
  supabase: ReturnType<typeof createClient>,
  telegramId: number,
  firstName: string,
  lastName: string,
  username: string,
): Promise<string | null> {
  // Check if profile already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existing) return existing.id;

  // Create auth user
  const STABLE_SALT = Deno.env.get("TELEGRAM_API_HASH") || "darkcyber_stable_salt";
  const email = `tg_${telegramId}@darkcyberx.app`;
  const password = `tg_${STABLE_SALT}_${telegramId}`;

  console.log(`Auto-registering Telegram user: ${username} (ID: ${telegramId})`);

  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      first_name: firstName,
      last_name: lastName,
      telegram_id: telegramId,
    },
  });

  if (createError) {
    // User might exist in auth but not have a profile with telegram_id
    if (createError.message?.includes("already registered") || createError.message?.includes("unique constraint")) {
      console.log("Auth user exists, finding and updating profile...");
      // Find by email in auth, then update profile
      const { data: users } = await supabase.auth.admin.listUsers();
      const authUser = users?.users?.find((u: any) => u.email === email);
      if (authUser) {
        await supabase.from("profiles").update({
          telegram_id: telegramId,
          first_name: firstName,
          last_name: lastName,
          username: username || undefined,
        }).eq("id", authUser.id);
        return authUser.id;
      }
    }
    console.error("Failed to create user:", createError);
    return null;
  }

  // Update the profile created by the handle_new_user trigger
  const userId = newUser.user.id;
  await supabase.from("profiles").update({
    telegram_id: telegramId,
    first_name: firstName,
    last_name: lastName,
    username: username || `user_${telegramId}`,
  }).eq("id", userId);

  console.log(`User auto-registered: ${userId}`);
  return userId;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!BOT_TOKEN) {
      return new Response(JSON.stringify({ error: "Bot token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const update = await req.json();

    // Extract user info from any message type
    const from = update.message?.from;
    const chatId = update.message?.chat?.id;

    // Handle /start command
    const text = update.message?.text || "";
    if (text.startsWith("/start")) {
      // Auto-register user on /start
      if (from && chatId) {
        await ensureUser(
          supabase,
          from.id,
          from.first_name || "",
          from.last_name || "",
          from.username || `user_${from.id}`,
        );
      }

      const parts = text.split(" ");

      if (parts.length > 1) {
        const slug = parts[1];
        console.log(`Deep link detected for slug: '${slug}'`);

        // Fetch file record
        const { data: file, error: fileError } = await supabase
          .from("files")
          .select("*")
          .eq("unique_slug", slug)
          .maybeSingle();

        if (fileError) {
          console.error("Database query error:", fileError);
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `❌ خطأ في قاعدة البيانات: ${fileError.message}`,
            }),
          });
        } else if (!file) {
          console.log(`No file found for slug: '${slug}'`);

          const { data: allFiles } = await supabase.from("files").select("unique_slug").limit(5);
          const availableSlugs = allFiles?.map(f => f.unique_slug).join(", ") || "none";

          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `❌ عذراً، الملف غير موجود.\nSlug search: ${slug}\nAvailable in DB: ${availableSlugs}`,
            }),
          });
        } else {
          console.log(`File found: ${file.filename}`);
          const sendResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              document: file.telegram_file_id,
              caption: `📄 <b>${file.filename}</b>\n📏 ${(file.size / 1048576).toFixed(2)} MB\n\nتم الإرسال من DarkCyberX Cloud ☁️`,
              parse_mode: "HTML",
              protect_content: true,
            }),
          });
          const sendData = await sendResp.json();
          if (sendData.ok) {
            // Update telegram_file_id with the fresh one from the sent message
            const newFileId = sendData.result?.document?.file_id;
            if (newFileId && newFileId !== file.telegram_file_id) {
              console.log(`Updating file_id for slug ${slug}: ${file.telegram_file_id} -> ${newFileId}`);
              await supabase.from("files").update({ telegram_file_id: newFileId }).eq("id", file.id);
            }
          } else {
            console.error("Telegram sendDocument error:", sendData);
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: `❌ فشل إرسال الملف عبر تيليجرام: ${sendData.description}`,
              }),
            });
          }
        }
      } else {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "مرحباً بك في DarkCyberX Cloud! ☁️\n\nأرسل لي أي ملف وسأعطيك رابط تحميل مباشر.\n\n📏 الحد الأقصى: 2GB\n\n🤖 @BotTelegramcloudbot",
            parse_mode: "HTML",
          }),
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle document/file
    const doc = update.message?.document;
    if (!doc) {
      return new Response(JSON.stringify({ ok: true, msg: "no document" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const filename = doc.file_name || "unnamed_file";
    const fileSize = doc.file_size || 0;
    const mimeType = doc.mime_type || "application/octet-stream";
    const fileId = doc.file_id;

    // Check file size
    if (fileSize > MAX_FILE_SIZE) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "❌ حجم الملف يتجاوز 2GB.",
        }),
      });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auto-register user if needed, then get profile id
    const profileId = from
      ? await ensureUser(
          supabase,
          from.id,
          from.first_name || "",
          from.last_name || "",
          from.username || `user_${from.id}`,
        )
      : null;

    if (!profileId) {
      console.log(`Could not find or create profile for chatId: ${chatId}`);
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `❌ حدث خطأ في إنشاء حسابك. يرجى المحاولة مرة أخرى.`,
          parse_mode: "HTML",
        }),
      });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save file record
    const slug = crypto.randomUUID().replace(/-/g, "").substring(0, 12);
    const { error: insertError } = await supabase.from("files").insert({
      user_id: profileId,
      telegram_file_id: fileId,
      filename,
      size: fileSize,
      mime_type: mimeType,
      unique_slug: slug,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: "❌ حدث خطأ أثناء حفظ الملف." }),
      });
      return new Response(JSON.stringify({ ok: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send success message
    const siteUrl = Deno.env.get("SITE_URL") || "";
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ تم رفع الملف بنجاح!\n\n📄 ${filename}\n📏 ${(fileSize / 1048576).toFixed(2)} MB\n\n🔗 رابط التحميل:\n${siteUrl}/d/${slug}`,
        parse_mode: "HTML",
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
