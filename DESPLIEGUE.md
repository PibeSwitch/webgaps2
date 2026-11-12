# GAPS · GitHub y Cloudflare Workers

Repositorio de destino: https://github.com/PibeSwitch/webgaps2

## Estado

La web local y el panel siguen funcionando sin cuentas externas. El proyecto tiene un segundo modo de compilación para Cloudflare Workers, con el administrador en Keystatic Cloud. La configuración remota no publica una API que pueda escribir en el disco del servidor.

`pnpm build` genera la web estática local en `dist/`. `pnpm build:cloudflare` genera el Worker y los archivos públicos en `dist-cloudflare/`. La segunda compilación toma sus valores de `scripts/deploy-defaults.mjs` y se detiene si son inválidos.

## 1. Panel de contenidos: Keystatic Cloud (modo por defecto)

La publicación en Cloudflare usa Keystatic Cloud. No hace falta GitHub App ni secretos en el Worker. Los valores por defecto están en `scripts/deploy-defaults.mjs`:

| Variable | Valor por defecto |
| --- | --- |
| `PUBLIC_KEYSTATIC_CLOUD_PROJECT` | `sitio/webgaps2` |
| `PUBLIC_SITE_URL` | `https://gaps-web.francisco-4a8.workers.dev` |

Una variable de compilación con el mismo nombre en Cloudflare los reemplaza, por ejemplo al conectar el dominio definitivo.

En keystatic.cloud:

1. Dentro del equipo `sitio`, crear el proyecto **`webgaps2`** y conectarlo al repositorio `PibeSwitch/webgaps2`.
2. En **Project URLs**, cargar `https://gaps-web.francisco-4a8.workers.dev` y, cuando exista, el dominio definitivo.
3. Invitar a los editores desde *Members*. No necesitan cuenta de GitHub. El plan gratuito permite hasta 3.

Al guardar en `/keystatic`, Keystatic hace un commit en `main` y Cloudflare vuelve a publicar.

## 2. Cloudflare Workers con compilación desde GitHub

1. Workers & Pages → Create → Import a repository → `PibeSwitch/webgaps2`, rama `main`, raíz del repositorio.
2. **Project name:** `gaps-web`. Tiene que coincidir con `wrangler.jsonc`.
3. **Build command:** `pnpm build:cloudflare`. **Deploy command:** `pnpm deploy:cloudflare`. Node sale de `.node-version` y pnpm de `packageManager`.
4. Guardar y ejecutar el primer despliegue. Los commits nuevos de `main` disparan compilación y publicación.

El adaptador avisa sobre un binding de KV `SESSION` para las sesiones de Astro; el sitio no usa sesiones. Las imágenes y PDF siguen versionados en el repositorio y R2 no está conectado.

## 3. Alternativa: modo GitHub (sin Keystatic Cloud)

Solo si se deja vacía `PUBLIC_KEYSTATIC_CLOUD_PROJECT` como variable de compilación en Cloudflare. En ese caso:

- Crear una GitHub App con permiso *Contents: Read and write*, instalada solo en `webgaps2` y con callback `<origen>/api/keystatic/github/oauth/callback`.
- Definir `PUBLIC_KEYSTATIC_GITHUB_REPO=PibeSwitch/webgaps2` y `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` como variables de compilación.
- Cargar `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` y `KEYSTATIC_SECRET` (aleatorio, de 32 caracteres o más) como secretos del Worker.
- Dar a cada editor permiso **Write** en el repositorio.

En local, `pnpm dev` sigue usando el editor de archivos, salvo que `.env` defina un repositorio de GitHub.

## Verificación final en la cuenta

- Iniciar sesión en Keystatic con una cuenta invitada y comprobar un guardado.
- Confirmar que una cuenta no invitada no pueda modificar contenido.
- Verificar que el commit generado dispare una compilación y que el sitio muestre el cambio.
- Confirmar enlaces, traducciones, formulario y previsualización al compartir en el dominio real.

La entrega de correo sigue en FormSubmit. Resend y R2 corresponden a otra etapa.

Referencias oficiales: https://keystatic.com/docs/cloud, https://keystatic.com/docs/github-mode y https://docs.astro.build/en/guides/integrations-guide/cloudflare/
