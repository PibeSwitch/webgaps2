import { existsSync } from 'node:fs';
import { loadEnv } from 'vite';
import { deploymentSettings } from './deploy-settings.mjs';

try {
  deploymentSettings({ ...loadEnv('production', process.cwd(), 'PUBLIC_'), ...process.env });
  console.log('Variables públicas de GitHub y URL del sitio: OK.');
  console.log(existsSync('dist-cloudflare/server') ? 'Compilación Cloudflare disponible.' : 'Pendiente: pnpm build:cloudflare.');
  console.log('La autenticación GitHub y los secretos del Worker requieren configuración y prueba en la cuenta de destino.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
