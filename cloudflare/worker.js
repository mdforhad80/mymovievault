export default {
  async fetch(request) {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get("endpoint");
    
    if (!endpoint) {
      return new Response(JSON.stringify({ error: "Missing endpoint parameter" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    
    const apiKey = "e10da2e2cbb23ea7ebfb64c3a188b64a";
    const apiUrl = `https://api.themoviedb.org/3/${endpoint}&api_key=${apiKey}`;
    
    try {
      const api = await fetch(apiUrl);
      const body = await api.text();
      
      return new Response(body, {
        status: api.status,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
