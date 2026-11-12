# GAPS · GitHub y Cloudflare Workers

Repositorio de destino: https://github.com/PibeSwitch/webgaps2

## Estado

La web local y el panel siguen funcionando sin cuentas externas. El proyecto tiene un segundo modo de compilación para Cloudflare Workers con el administrador conectado a GitHub. La configuración remota no publica una API que pueda escribir en el disco del servidor.

`pnpm build` genera la web estática local en `dist/`. `pnpm build:cloudflare` genera el Worker y los archivos públicos en `dist-cloudflare/`. La segunda compilación requiere las tres variables públicas siguientes y se detiene si faltan. La compilación de prueba usa valores temporales claramente identificados y no equivale a un despliegue.

## 1. Aplicación de GitHub para Keystatic

La conexión de GitHub de Codex y la aplicación de Keystatic son independientes. Keystatic necesita su propia aplicación para identificar al consultor y guardar cambios en el repositorio.

1. Copiar `.env.example` a `.env` para configurar el entorno local de preparación; el repositorio ya figura como `PibeSwitch/webgaps2`.
2. Reiniciar el servidor y abrir `/keystatic`. En modo GitHub, seguir el asistente de creación de la aplicación de GitHub con tu cuenta. El inicio de sesión y la concesión de permisos los debe completar el titular de la cuenta.
3. Instalar la aplicación solo en `webgaps2`. Registrar el nombre real de la aplicación en `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
4. Agregar como callback la URL del administrador desplegado seguida de `/api/keystatic/github/oauth/callback`; conservar el callback local que propone el asistente si se quiere seguir administrando desde esta computadora.
5. Cargar en Cloudflare, como secretos del Worker, `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` y `KEYSTATIC_SECRET`. El asistente puede generarlos en el archivo local `.env`; nunca se sube ese archivo ni se pegan sus valores en un chat. Si se configura manualmente `KEYSTATIC_SECRET`, usar un valor aleatorio de al menos 32 caracteres.

Para volver al editor de archivos local, dejar vacía `PUBLIC_KEYSTATIC_GITHUB_REPO` en el entorno de desarrollo y reiniciar. No eliminar las variables públicas del entorno de Cloudflare.

## 2. Cloudflare Workers con compilación desde GitHub

1. Iniciar sesión en Cloudflare y crear o seleccionar un Worker conectado al repositorio `PibeSwitch/webgaps2`, rama `main`, con el proyecto en la raíz.
2. Usar Node.js 24 y pnpm 11.25.0. El archivo de dependencias es `pnpm-lock.yaml`.
3. Configurar estas variables de compilación, que no son secretos:

| Variable | Valor |
| --- | --- |
| `PUBLIC_KEYSTATIC_GITHUB_REPO` | `PibeSwitch/webgaps2` |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Nombre real de la aplicación creada en el paso anterior |
| `PUBLIC_SITE_URL` | Origen HTTPS real del Worker o del dominio definitivo, sin ruta |

4. Comando de compilación: `pnpm build:cloudflare`. Comando de despliegue: `pnpm deploy:cloudflare`. La instalación de dependencias usa `pnpm install --frozen-lockfile`.
5. Configurar los tres secretos del paso 1 en el entorno de ejecución del Worker. No usar el prefijo `PUBLIC_` para ellos.
6. Guardar y ejecutar el primer despliegue. Confirmar que los commits nuevos de `main` disparen compilación y publicación.

El adaptador puede crear un binding de KV llamado `SESSION` para las sesiones de Astro. Las imágenes y PDF de esta etapa siguen versionados en el repositorio; R2 aún no está conectado.

## 3. Acceso de los consultores

Agregar a cada consultor como colaborador con permiso **Write** en GitHub. Todos comparten el mismo alcance de edición y pueden guardar contenido de cualquier sección. Cada persona inicia sesión con su propia cuenta en `/keystatic`.

Desmarcar Borrador hace que la entrada se incluya en la próxima compilación. Guardar en el panel genera cambios en GitHub; la web publicada se actualiza cuando termina la compilación automática de Cloudflare. No hay una aprobación editorial intermedia configurada.

## Verificación final en la cuenta

- Iniciar sesión en Keystatic con una cuenta autorizada y comprobar un guardado.
- Confirmar que una cuenta sin permiso de escritura no pueda modificar contenido.
- Verificar que el commit generado dispare una compilación y que el sitio muestre el cambio.
- Confirmar enlaces, traducciones, formulario y previsualización al compartir en el dominio real.

La entrega de correo sigue en FormSubmit. Resend y R2 corresponden a otra etapa.

Referencias oficiales: https://keystatic.com/docs/github-mode y https://docs.astro.build/en/guides/integrations-guide/cloudflare/
