import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client, StorageMemory } from "https://deno.land/x/mtkruto@0.14.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Global cache to avoid repeated logins
let globalClient: Client | null = null;
let clientLastStarted = 0;

Deno.serve(async (req) => {
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
      .single();

    if (error || !file) {
      return new Response(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- HYBRID APPROACH ---
    // For files < 20MB, use official API (no login, no flood wait)
    if (file.size < 20 * 1024 * 1024) {
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
    }

    // --- MTProto Streaming (for > 20MB) ---
    // Parse Range header
    const rangeHeader = req.headers.get("range");
    let start = 0;
    let end = file.size - 1;
    let status = 200;

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
      if (match) {
        start = parseInt(match[1], 10);
        if (match[2]) end = parseInt(match[2], 10);
        status = 206;
      }
    }

    const contentLength = end - start + 1;

    // Ensure client is alive and reused
    if (!globalClient || (Date.now() - clientLastStarted > 300000)) { // Re-init every 5 mins or if null
      globalClient = new Client({
        storage: new StorageMemory(),
        apiId: API_ID,
        apiHash: API_HASH,
      });
      await globalClient.start({ botToken: BOT_TOKEN });
      clientLastStarted = Date.now();
    }

    // In 0.14.0, download is the standard method
    console.log(`Initializing chunks for file: ${file.filename}`);
    const chunks = globalClient.download(file.telegram_file_id, {
      offset: BigInt(start),
      limit: contentLength
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let bytesSent = 0;
          for await (const chunk of chunks) {
            const remaining = contentLength - bytesSent;
            if (remaining <= 0) break;
            const toSend = chunk.length > remaining ? chunk.slice(0, remaining) : chunk;
            controller.enqueue(toSend);
            bytesSent += toSend.length;
          }
          controller.close();
        } catch (e) {
          console.error("Stream error:", e);
          controller.error(e);
        }
      }
    });

    const responseHeaders = new Headers({
      ...corsHeaders,
      "Content-Type": file.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.filename)}"`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength.toString(),
      "ETag": `"${file.unique_slug}-${file.size}"`,
      "Last-Modified": new Date(file.created_at || Date.now()).toUTCString(),
      "Cache-Control": "private, max-age=3600",
    });

    if (status === 206) {
      responseHeaders.set("Content-Range", `bytes ${start}-${end}/${file.size}`);
    }

    return new Response(readable, { status, headers: responseHeaders });

  } catch (err) {
    console.error("Catch:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
