interface Env {
    ASSETS: {
        fetch: (request: Request | URL) => Promise<Response>;
    };
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const response = await env.ASSETS.fetch(request);

        // If the asset is not found (404), serve index.html for SPA routing
        if (response.status === 404) {
            return env.ASSETS.fetch(new URL("/", request.url));
        }

        return response;
    }
};
