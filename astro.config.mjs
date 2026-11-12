import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';
import { loadEnv } from 'vite';
import { deploymentSettings } from './scripts/deploy-settings.mjs';
import { fileURLToPath } from 'node:url';

const remote = process.env.GAPS_DEPLOY_TARGET === 'cloudflare';
if (remote) deploymentSettings({ ...loadEnv('production', process.cwd(), 'PUBLIC_'), ...process.env });

// The local filesystem API is available only in the loopback development server.
const localEditor = () => {
  const editor = keystatic();
  return {
    name: 'gaps-local-editor',
    hooks: {
      'astro:config:setup': options => {
        if (remote || options.command === 'dev') return editor.hooks['astro:config:setup'](options);
      },
    },
  };
};

export default defineConfig({
  output: 'static',
  ...(remote ? { output: 'server', outDir: './dist-cloudflare', adapter: cloudflare({ prerenderEnvironment: 'node', imageService: 'passthrough' }) } : {}),
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  integrations: [react(), localEditor()],
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { 'virtual:keystatic-config': fileURLToPath(new URL('./keystatic.config.ts', import.meta.url)) } },
  },
});
