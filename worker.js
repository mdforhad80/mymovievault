export default {
    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname.startsWith('/api/')) {
            const apiUrl = `https://api.jikan.moe/v4${url.pathname.slice(4)}${url.search}`;
            return fetch(apiUrl, {
                headers: { 'User-Agent': 'KaiCrush/1.0' }
            });
        }
        return fetch(request);
    }
}
