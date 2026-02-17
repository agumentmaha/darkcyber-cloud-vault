import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client } from "https://deno.land/x/mtkruto@0.8.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const API_ID = Number(Deno.env.get("TELEGRAM_API_ID"));
    const API_HASH = Deno.env.get("TELEGRAM_API_HASH");

    if (!BOT_TOKEN || !API_ID || !API_HASH) {
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
      .eq("is_blocked", false)
      .single();

    if (error || !file) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Starting MTKruto stream for: ${file.filename} (${file.size} bytes)`);

    // Initialize MTKruto Client
    const client = new Client({
      apiId: API_ID,
      apiHash: API_HASH,
    });

    await client.start(BOT_TOKEN);

    // Get the file iterator
    const chunks = client.downloadFile(file.telegram_file_id);

    // Transform AsyncIterable to ReadableStream
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (e) {
          console.error("Stream error:", e);
          controller.error(e);
        } finally {
          try {
            await client.signOut();
          } catch (e) {
            // Ignore signout errors on cleanup
          }
        }
      },
      cancel() {
        console.log("Stream cancelled by user");
      }
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": file.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.filename)}"`,
        "Content-Length": file.size.toString(),
      },
    });

  } catch (err) {
    console.error("Download error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
