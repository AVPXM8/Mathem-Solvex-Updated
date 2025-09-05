// middleware.mjs (ESM) — Vercel middleware for Vite SPA + Prerender.io
// Note the .mjs extension and ESM syntax (import/export)
import { next } from '@vercel/functions';

const BOT_UAS = [
  'googlebot','bingbot','yandex','baiduspider','facebookexternalhit',
  'twitterbot','linkedinbot','slackbot','discordbot','redditbot','applebot',
  'qwantify','whatsapp'
];

// This config is Vercel platform-specific and works with any framework
export const config = {
  matcher: ['/((?!api|.*\\..*).*)'],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const isBot = BOT_UAS.some(b => ua.includes(b));

  // If not a bot, pass through to the normal SPA
  if (!isBot) {
    return next();
  }

  const token = process.env.PRERENDER_TOKEN;
  if (!token) {
    console.warn('PRERENDER_TOKEN is not set. Skipping prerender.');
    return next(); // Fail open if the token is missing
  }

  const prerenderUrl = `https://service.prerender.io/${url.toString()}`;

  try {
    const resp = await fetch(prerenderUrl, {
      headers: { 'x-prerender-token': token }
    });

    const body = await resp.text();

    // Pass through cache headers from Prerender to help bots/CDNs
    const headers = new Headers(resp.headers);
    headers.set('content-type', 'text/html; charset=utf-8');

    return new Response(body, { status: resp.status, headers });
  } catch (err) {
    console.error('Prerender request failed:', err);
    // If Prerender is unavailable, let the normal SPA respond
    return next();
  }
}