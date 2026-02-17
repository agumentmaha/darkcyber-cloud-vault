import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac, createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function verifyTelegramData(data: Record<string, string>, botToken: string): boolean {
  const checkString = Object.keys(data)
    .filter((k) => k !== "hash")
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join("\n");

  const secretKey = createHash("sha256").update(botToken).digest();
  const hmac = createHmac("sha256", secretKey).update(checkString).digest("hex");

  return hmac === data.hash;
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

    const telegramData = await req.json();

    // Verify auth_date is recent (within 1 day)
    const authDate = parseInt(telegramData.auth_date);
    if (Date.now() / 1000 - authDate > 86400) {
      return new Response(JSON.stringify({ error: "Auth data expired" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify hash
    if (!verifyTelegramData(telegramData, BOT_TOKEN)) {
      return new Response(JSON.stringify({ error: "Invalid hash" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const telegramId = telegramData.id;
    const firstName = telegramData.first_name || "";
    const lastName = telegramData.last_name || "";
    const username = telegramData.username || `user_${telegramId}`;
    const photoUrl = telegramData.photo_url || "";

    // Synthetic email for this Telegram user
    const email = `tg_${telegramId}@darkcyberx.app`;
    const password = `tg_${BOT_TOKEN}_${telegramId}`;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try to sign in first
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    let session = null;

    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (signInData?.session) {
      session = signInData.session;

      // Update profile with latest Telegram info
      await supabaseAdmin.from("profiles").update({
        telegram_id: telegramId,
        first_name: firstName,
        last_name: lastName,
        username,
        avatar_url: photoUrl,
      }).eq("id", signInData.user.id);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          first_name: firstName,
          last_name: lastName,
          telegram_id: telegramId,
          avatar_url: photoUrl,
        },
      });

      if (createError) {
        console.error("Create user error:", createError);
        return new Response(JSON.stringify({ error: "Failed to create user" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update profile with Telegram data
      await supabaseAdmin.from("profiles").update({
        telegram_id: telegramId,
        first_name: firstName,
        last_name: lastName,
        username,
        avatar_url: photoUrl,
      }).eq("id", newUser.user.id);

      // Sign in the new user
      const { data: newSignIn } = await supabaseAnon.auth.signInWithPassword({
        email,
        password,
      });

      session = newSignIn?.session;
    }

    if (!session) {
      return new Response(JSON.stringify({ error: "Failed to create session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        token_type: session.token_type,
      },
      user: {
        id: session.user.id,
        username,
        first_name: firstName,
        last_name: lastName,
        telegram_id: telegramId,
        avatar_url: photoUrl,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Telegram auth error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
