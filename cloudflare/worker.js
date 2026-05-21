// ============================================
// CLOUDFLARE WORKER (Optional)
// Can be used for API proxying or caching
// ============================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Proxy Jikan API requests (optional caching layer)
    if (url.pathname.startsWith('/api/jikan/')) {
      const jikanPath = url.pathname.replace('/api/jikan/', '');
      const jikanUrl = `https://api.jikan.moe/v4/${jikanPath}${url.search}`;

      try {
        const response = await fetch(jikanUrl, {
          cf: { cacheTtl: 300 } // Cache for 5 minutes
        });

        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...response.headers,
            ...corsHeaders,
            'Cache-Control': 'public, max-age=300'
          }
        });

        return newResponse;
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve static assets (if using Workers Sites)
    // For Cloudflare Pages, this worker is optional
    return new Response('AnimeStream Worker', { 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
    });
  }
};
