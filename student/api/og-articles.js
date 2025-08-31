export const config = { runtime: 'edge' };

const BACKEND = process.env.BACKEND_URL || 'https://mathemsolvex.onrender.com';
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL || 'https://question.maarula.in';

function stripHtml(s = '') {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function blogJsonLd(p, url) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": p.title,
    "description": p.summary || stripHtml(p.excerpt || '').slice(0, 160),
    "image": p.coverImage ? [p.coverImage] : undefined,
    "datePublished": p.createdAt || p.publishedAt || p.updatedAt,
    "dateModified": p.updatedAt || p.createdAt,
    "author": p.author?.name ? { "@type": "Person", "name": p.author.name } : { "@type": "Organization", "name": "Maarula" },
    "publisher": { "@type": "Organization", "name": "Maarula" },
    "mainEntityOfPage": { "@type": "WebPage", "@id": url }
  };
}

async function fetchPostBySlug(slug) {
  // Try both common patterns so we don't need backend changes:
  const urls = [
    `${BACKEND}/api/posts/slug/${encodeURIComponent(slug)}`,
    `${BACKEND}/api/posts/${encodeURIComponent(slug)}`
  ];
  for (const u of urls) {
    const r = await fetch(u, { headers: { 'Accept': 'application/json' } });
    if (r.ok) return r.json();
    if (r.status === 404) continue;
    // On other errors, try next anyway
  }
  return null;
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) return new Response('Missing slug', { status: 400 });

    const p = await fetchPostBySlug(slug);
    const url = `${PUBLIC_BASE}/articles/${slug}`;

    if (!p) {
      const nf = `<!doctype html><html><head>
<meta name="robots" content="noindex">
<title>Article not found | Maarula</title>
<link rel="canonical" href="${url}">
</head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`;
      return new Response(nf, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' }});
    }

    const title = `${p.title} | Maarula`;
    const desc = p.summary || stripHtml(p.excerpt || p.content || '').slice(0, 160);
    const image = p.coverImage || `${PUBLIC_BASE}/maarulalogo.png`;
    const jsonLd = blogJsonLd(p, url);

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${url}">

<meta property="og:type" content="article">
<meta property="og:site_name" content="Maarula">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${image}">

<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300'
      }
    });
  } catch (e) {
    return new Response('Edge error', { status: 500 });
  }
}
