// Minimalist test function
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json().catch(() => ({}));
        console.log("Minimalist function received body:", body);

        return new Response(JSON.stringify({
            success: true,
            message: "Minimalist function is working",
            received: body
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: "Unexpected function error", details: (err as Error).message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
        });
    }
})
