export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    if (request.method !== 'POST' || url.pathname !== '/v1/chat/completions') {
      return corsResponse({ error: 'Not found.' }, 404);
    }

    if (!env.OPENAI_API_KEY) {
      return corsResponse({ error: 'Trial gateway is not configured.' }, 503);
    }

    const body = await request.json();
    const upstreamBody = {
      ...body,
      model: env.OPENAI_MODEL || 'gpt-5.5',
      stream: false,
    };

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(upstreamBody),
    });

    const text = await upstream.text();

    return new Response(text, {
      status: upstream.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      },
    });
  },
};

function corsResponse(payload, status) {
  return new Response(payload ? JSON.stringify(payload) : null, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json',
    },
  });
}
