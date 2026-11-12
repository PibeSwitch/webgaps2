// Valores por defecto de la publicación en Cloudflare. Una variable de entorno con el mismo nombre los reemplaza.
export const deployDefaults = {
  // Panel de contenidos en Keystatic Cloud (equipo/proyecto en keystatic.cloud). No requiere claves en el Worker.
  PUBLIC_KEYSTATIC_CLOUD_PROJECT: 'sitio/webgaps2',
  // Origen del Worker "webgaps2". Cambiarlo cuando se conecte el dominio definitivo.
  PUBLIC_SITE_URL: 'https://webgaps2.francisco-4a8.workers.dev',
};

/** Variables de entorno con los valores por defecto aplicados (las definidas en el entorno ganan). */
export const withDefaults = env => {
  const out = { ...env };
  for (const [k, v] of Object.entries(deployDefaults)) if (!out[k]?.trim()) out[k] = v;
  return out;
};
