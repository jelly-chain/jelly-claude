#!/usr/bin/env node
// Tiny proxy: strips Anthropic-only beta headers before forwarding to OpenRouter
import http from 'http';
import https from 'https';
import { URL } from 'url';

const PORT = process.env.PROXY_PORT || 7788;
const TARGET = 'https://openrouter.ai';
const DEBUG = process.env.PROXY_DEBUG === '1';

const STRIP_BETA_FEATURES = [
  'context-management-2025-06-27',
  'interleaved-thinking-2025-05-14',
  'output-128k-2025-02-19',
];

function patchBetaHeader(value) {
  if (!value) return undefined;
  const kept = value.split(',').map(s => s.trim()).filter(f => !STRIP_BETA_FEATURES.includes(f));
  return kept.length ? kept.join(',') : undefined;
}

const server = http.createServer((req, res) => {
  const targetUrl = new URL(req.url, TARGET);

  const headers = { ...req.headers };
  headers.host = targetUrl.hostname;

  if (headers['anthropic-beta']) {
    const before = headers['anthropic-beta'];
    const patched = patchBetaHeader(headers['anthropic-beta']);
    if (patched) {
      headers['anthropic-beta'] = patched;
    } else {
      delete headers['anthropic-beta'];
    }
    if (DEBUG) console.log(`[proxy] anthropic-beta: ${before} → ${patched || '(removed)'}`);
  }

  if (DEBUG) console.log(`[proxy] ${req.method} ${targetUrl.pathname}`);

  // Buffer the body so we can inspect / transform it
  const bodyChunks = [];
  req.on('data', chunk => bodyChunks.push(chunk));
  req.on('end', () => {
    let body = Buffer.concat(bodyChunks);
    let bodyStr = body.toString('utf8');

    // Patch request body: remove system_prompt_caching and context_management keys
    if (bodyStr && (headers['content-type'] || '').includes('application/json')) {
      try {
        const parsed = JSON.parse(bodyStr);
        if (DEBUG) console.log('[proxy] request body keys:', Object.keys(parsed));
        // Remove any context-management or caching features in the body
        delete parsed.system_prompt_prefix;
        delete parsed.context_management;
        delete parsed.output_config;
        if (Array.isArray(parsed.system) && parsed.system.some(s => s.cache_control)) {
          parsed.system = parsed.system.map(s => { const c = { ...s }; delete c.cache_control; return c; });
        }
        const newStr = JSON.stringify(parsed);
        body = Buffer.from(newStr, 'utf8');
        headers['content-length'] = body.length.toString();
      } catch (_) {}
    }

    const options = {
      hostname: targetUrl.hostname,
      port: 443,
      path: targetUrl.pathname + (targetUrl.search || ''),
      method: req.method,
      headers,
    };

    const proxyReq = https.request(options, proxyRes => {
      if (DEBUG) console.log(`[proxy] response: ${proxyRes.statusCode}`);
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', err => {
      console.error('Proxy error:', err.message);
      res.writeHead(502);
      res.end(JSON.stringify({ error: err.message }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Proxy listening on http://127.0.0.1:${PORT} → ${TARGET}`);
  console.log('Stripping beta features:', STRIP_BETA_FEATURES.join(', '));
});
