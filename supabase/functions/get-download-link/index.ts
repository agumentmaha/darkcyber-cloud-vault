import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");

    if (!BOT_TOKEN) {
      throw new Error("Telegram credentials not configured");
    }

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get file record
    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("unique_slug", slug)
      .single();

    if (error || !file) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file.telegram_file_id}`);
    const fileData = await fileResp.json();
    if (fileData.ok && fileData.result?.file_path) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          "Location": `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`,
        }
      });
    }

    return new Response(JSON.stringify({ error: "File expired or unavailable" }), {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Catch:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
