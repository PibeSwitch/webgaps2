import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { loadEnv } from 'vite';
import { deploymentSettings } from './deploy-settings.mjs';
import { withDefaults } from './deploy-defaults.mjs';

try {
  deploymentSettings(withDefaults({ ...loadEnv('production', process.cwd(), 'PUBLIC_'), ...process.env }));
  const generated = 'dist-cloudflare/server/wrangler.json';
  if (!existsSync(generated)) throw new Error('Primero ejecutá pnpm build:cloudflare.');
  const result = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'deploy', '--config', generated], { stdio: 'inherit', env: process.env });
  process.exit(result.status ?? 1);
} catch (error) { console.error(error.message); process.exit(1); }
