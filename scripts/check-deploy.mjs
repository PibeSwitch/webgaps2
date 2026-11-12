import { existsSync } from 'node:fs';
import { loadEnv } from 'vite';
import { deploymentSettings } from './deploy-settings.mjs';
import { withDefaults } from './deploy-defaults.mjs';

try {
  const s = deploymentSettings(withDefaults({ ...loadEnv('production', process.cwd(), 'PUBLIC_'), ...process.env }));
  console.log(s.mode === 'cloud' ? `Keystatic Cloud (${s.cloud}) y URL del sitio (${s.origin}): OK.` : 'Variables públicas de GitHub y URL del sitio: OK.');
  console.log(existsSync('dist-cloudflare/server') ? 'Compilación Cloudflare disponible.' : 'Pendiente: pnpm build:cloudflare.');
  if (s.mode === 'github') console.log('La autenticación GitHub y los secretos del Worker requieren configuración y prueba en la cuenta de destino.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
