import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

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

    // Handle /start command
    const text = update.message?.text || "";
    if (text.startsWith("/start")) {
      const chatId = update.message.chat.id;
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

          // Debug: List some slugs to see what the bot sees
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
          // Send the file directly
          const sendResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              document: file.telegram_file_id,
              caption: `📄 <b>${file.filename}</b>\n📏 ${(file.size / 1048576).toFixed(2)} MB\n\nتم الإرسال من DarkCyberX Cloud ☁️`,
              parse_mode: "HTML",
            }),
          });
          const sendData = await sendResp.json();
          if (!sendData.ok) {
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
            text: "مرحباً بك في DarkCyberX Cloud! ☁️\n\nأرسل لي أي ملف وسأعطيك رابط تحميل مباشر.\n\n📏 الحد الأقصى: 2GB\n\n🤖 @T7meelExpressBot",
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

    const chatId = update.message.chat.id;
    const filename = doc.file_name || "unnamed_file";
    const fileSize = doc.file_size || 0;
    const mimeType = doc.mime_type || "application/octet-stream";
    const fileId = doc.file_id;

    const ext = filename.toLowerCase().split(".").pop();

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

    // Find user by telegram_id
    console.log(`Searching for profile with telegram_id: ${chatId}`);
    const { data: profile, error: searchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("telegram_id", chatId)
      .maybeSingle();

    if (searchError) {
      console.error("Profile search error:", searchError);
    }

    if (!profile) {
      console.log(`Profile not found for chatId: ${chatId}`);
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `❌ يجب تسجيل الدخول في الموقع أولاً.\n\nالـ ID الخاص بك هو: <code>${chatId}</code>\nيرجى التأكد من ربطه بحسابك في الموقع.`,
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
      user_id: profile.id,
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
    const siteUrl = Deno.env.get("SITE_URL") || "https://darkcyber-cloud-vault.darkcybercloud.workers.dev";
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
