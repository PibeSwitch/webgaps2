import { spawnSync } from 'node:child_process';
import { loadEnv } from 'vite';
import { deploymentSettings } from './deploy-settings.mjs';

try {
  const env = { ...loadEnv('production', process.cwd(), 'PUBLIC_'), ...process.env };
  deploymentSettings(env);
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { stdio: 'inherit', env: { ...env, GAPS_DEPLOY_TARGET: 'cloudflare' } });
  process.exit(result.status ?? 1);
} catch (error) { console.error(error.message); process.exit(1); }
