export const config = { runtime: 'edge' };

const BACKEND = process.env.BACKEND_URL || 'https://<your-render-app>.onrender.com';
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL || 'https://question.maarula.in';

function stripHtmlAndMath(s = '') {
  return (s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\$+[^$]*\$+/g, '')
    .replace(/\\\[.*?\\\]/gs, '')
    .replace(/\\\((.|\n)*?\\\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function qaJsonLd(q, url) {
  const accepted = (q.options || []).find(o => o.isCorrect);
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": stripHtmlAndMath(q.questionText).slice(0, 180),
      "text": stripHtmlAndMath(q.questionText),
      "answerCount": (q.options || []).length,
      ...(accepted ? {
        "acceptedAnswer": {
          "@type": "Answer",
          "text": stripHtmlAndMath(accepted.text || '')
        }
      } : {}),
      "dateCreated": q.createdAt || q.updatedAt,
      "about": q.subject,
      "eduQuestionType": q.difficulty || undefined,
      "url": url
    }
  };
}

export default async function handler(req) {
  try {
    const { searchParams, pathname } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return new Response('Missing id', { status: 400 });

    // fetch from your existing backend route
    const apiRes = await fetch(`${BACKEND}/api/questions/${encodeURIComponent(id)}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (apiRes.status === 404) {
      const url = `${PUBLIC_BASE}/question/${id}`;
      const notFoundHtml = `<!doctype html><html><head>
<meta name="robots" content="noindex">
<title>Question not found | Maarula</title>
<link rel="canonical" href="${url}">
</head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`;
      return new Response(notFoundHtml, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' }});
    }

    if (!apiRes.ok) {
      return new Response('Upstream error', { status: 502 });
    }

    const q = await apiRes.json();

    const url = `${PUBLIC_BASE}/question/${q._id}`;
    const title = `${stripHtmlAndMath(q.questionText).slice(0, 60)}... | Maarula`;
    const desc = `Practice problem: ${q.subject} — ${q.exam} ${q.year}. Detailed answer and explanation inside.`;
    const image = q.questionImageURL || `${PUBLIC_BASE}/maarulalogo.png`;
    const jsonLd = qaJsonLd(q, url);

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
