const PROJECT = process.env.VITE_FIREBASE_PROJECT_ID || 'sekaa-42eb6';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  const id = String(req.query.id || '').replace(/[^A-Za-z0-9_-]/g, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `https://${host}`;

  let fields = null;
  if (id) {
    try {
      const r = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/memes/${id}`
      );
      if (r.ok) fields = (await r.json()).fields || null;
    } catch {}
  }

  const caption = fields?.caption?.stringValue || 'Check out this meme';
  const media = fields?.mediaUrl?.stringValue || '';
  const isVideo = fields?.type?.stringValue === 'reel';
  const pageUrl = `${origin}/m/${id}`;
  const appUrl = `${origin}/?meme=${id}`;

  const tags = [
    `<meta property="og:type" content="${isVideo ? 'video.other' : 'article'}" />`,
    `<meta property="og:title" content="${esc(caption)}" />`,
    `<meta property="og:description" content="Open to see the meme" />`,
    `<meta property="og:url" content="${esc(pageUrl)}" />`,
    `<meta name="twitter:card" content="${isVideo ? 'player' : 'summary_large_image'}" />`,
    `<meta name="twitter:title" content="${esc(caption)}" />`,
  ];
  if (media && !isVideo) {
    tags.push(`<meta property="og:image" content="${esc(media)}" />`);
    tags.push(`<meta name="twitter:image" content="${esc(media)}" />`);
  }
  if (media && isVideo) {
    tags.push(`<meta property="og:video" content="${esc(media)}" />`);
  }

  const html = `<!doctype html><html><head><meta charset="utf-8" />
<title>${esc(caption)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
${tags.join('\n')}
<meta http-equiv="refresh" content="0;url=${esc(appUrl)}" />
</head><body style="background:#0A0A0A;color:#fff;font-family:sans-serif">
<script>location.replace(${JSON.stringify(appUrl)});</script>
<a href="${esc(appUrl)}" style="color:#E6FF00">Open meme</a>
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
  res.status(200).send(html);
}