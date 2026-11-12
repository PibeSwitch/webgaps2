export function deploymentSettings(env) {
  const repo = env.PUBLIC_KEYSTATIC_GITHUB_REPO?.trim();
  const appSlug = env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG?.trim();
  const site = env.PUBLIC_SITE_URL?.trim();
  if (!repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('Falta PUBLIC_KEYSTATIC_GITHUB_REPO con el formato cuenta/gaps-web.');
  if (!appSlug || !/^[a-z0-9-]+$/.test(appSlug)) throw new Error('Falta PUBLIC_KEYSTATIC_GITHUB_APP_SLUG (nombre de la GitHub App).');
  let url;
  try { url = new URL(site); } catch { throw new Error('Falta PUBLIC_SITE_URL con la dirección HTTPS del sitio.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('PUBLIC_SITE_URL debe ser un origen HTTPS sin ruta ni credenciales.');
  return { repo, appSlug, origin: url.origin };
}
