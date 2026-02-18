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
    // Synthetic account for Telegram user
    // We use a stable salt here so changing bots doesn't break existing user logins
    const STABLE_SALT = Deno.env.get("TELEGRAM_API_HASH") || "darkcyber_stable_salt";
    const email = `tg_${telegramId}@darkcyberx.app`;
    const password = `tg_${STABLE_SALT}_${telegramId}`;

    console.log(`Authenticating user: ${username} (ID: ${telegramId}, Email: ${email})`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    let session = null;
    let userId = null;

    console.log("Attempting sign in with synthetic email...");
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (signInData?.session) {
      console.log("Existing user found, session grabbed.");
      session = signInData.session;
      userId = signInData.user.id;

      await supabaseAdmin.from("profiles").update({
        telegram_id: telegramId,
        first_name: firstName,
        last_name: lastName,
        username,
        avatar_url: photoUrl,
      }).eq("id", userId);
    } else {
      console.log("New user detected, creating via admin...");
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
        console.error("Admin user creation failed:", createError);

        // RECOVERY LOGIC: If user already exists (likely due to old bot token password), update password
        if (createError.message?.includes("already registered") || createError.message?.includes("unique constraint")) {
          console.log("User already exists but sign-in failed. Attempting password recovery/migration...");

          // Find the user's ID via profile
          const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("telegram_id", telegramId)
            .maybeSingle();

          if (existingProfile) {
            console.log(`Found existing profile for recovery: ${existingProfile.id}. Updating password...`);
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              existingProfile.id,
              { password: password }
            );

            if (updateError) {
              console.error("Failed to update password during recovery:", updateError);
              throw updateError;
            }

            console.log("Password updated. Retrying sign-in...");
            const { data: retrySignIn, error: retryError } = await supabaseAnon.auth.signInWithPassword({
              email,
              password,
            });

            if (retryError) throw retryError;
            session = retrySignIn?.session;
          } else {
            console.error("User exists in Auth but no Profile found. Cannot recover.");
            throw createError;
          }
        } else {
          throw createError;
        }
      } else {
        // Normal new user creation success
        userId = newUser.user.id;
        console.log(`User created: ${userId}. Linking profile...`);

        await supabaseAdmin.from("profiles").update({
          telegram_id: telegramId,
          first_name: firstName,
          last_name: lastName,
          username,
          avatar_url: photoUrl,
        }).eq("id", userId);

        console.log("Signing in new user...");
        const { data: newSignIn, error: newSignInError } = await supabaseAnon.auth.signInWithPassword({
          email,
          password,
        });

        if (newSignInError) {
          console.error("Post-creation sign-in failed:", newSignInError);
          throw newSignInError;
        }
        session = newSignIn?.session;
      }
    }

    if (!session) throw new Error("Could not establish auth session");

    console.log("Auth successful. Returning session data.");

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
