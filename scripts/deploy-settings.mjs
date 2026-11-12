export function deploymentSettings(env) {
  const cloud = env.PUBLIC_KEYSTATIC_CLOUD_PROJECT?.trim();
  const repo = env.PUBLIC_KEYSTATIC_GITHUB_REPO?.trim();
  const appSlug = env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG?.trim();
  const site = env.PUBLIC_SITE_URL?.trim();
  if (cloud) {
    // Keystatic Cloud: alcanza con el proyecto (equipo/proyecto); no hacen falta GitHub App ni secretos.
    if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(cloud)) throw new Error('PUBLIC_KEYSTATIC_CLOUD_PROJECT debe tener el formato equipo/proyecto.');
  } else {
    if (!repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('Falta PUBLIC_KEYSTATIC_CLOUD_PROJECT (equipo/proyecto) o PUBLIC_KEYSTATIC_GITHUB_REPO (cuenta/repositorio).');
    if (!appSlug || !/^[a-z0-9-]+$/.test(appSlug)) throw new Error('Falta PUBLIC_KEYSTATIC_GITHUB_APP_SLUG (nombre de la GitHub App).');
  }
  let url;
  try { url = new URL(site); } catch { throw new Error('Falta PUBLIC_SITE_URL con la dirección HTTPS del sitio.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('PUBLIC_SITE_URL debe ser un origen HTTPS sin ruta ni credenciales.');
  return { mode: cloud ? 'cloud' : 'github', cloud, repo, appSlug, origin: url.origin };
}
