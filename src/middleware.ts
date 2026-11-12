import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const path = context.url.pathname;
  if (path === '/keystatic' || path.startsWith('/keystatic/') || path.startsWith('/api/keystatic/')) {
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (import.meta.env.PROD) {
      const html = response.headers.get('content-type')?.includes('text/html') ? await response.text() : null;
      const hashesFor = async (blocks: string[]) => Promise.all(blocks.filter(block => block.trim()).map(async block => {
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(block));
        return `'sha256-${btoa(String.fromCharCode(...new Uint8Array(hash)))}'`;
      }));
      const scripts = html ? [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]) : [];
      const styles = html ? [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]) : [];
      const [scriptHashes, styleHashes] = await Promise.all([hashesFor(scripts), hashesFor(styles)]);
      response.headers.set('Content-Security-Policy', `default-src 'self'; script-src 'self' ${scriptHashes.join(' ')}; style-src 'self' ${styleHashes.join(' ')}; font-src 'self'; img-src 'self' data: blob: https://avatars.githubusercontent.com; connect-src 'self' https://api.github.com https://github.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https://github.com`);
      if (html !== null) return new Response(html, { status: response.status, statusText: response.statusText, headers: response.headers });
    }
  }
  return response;
});
