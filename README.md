# GAPS · Astro + Tailwind

Primera implementación para revisión visual. Astro 6, Tailwind 4 e IBM Plex Sans alojada localmente. Sitio estático preparado para Cloudflare. No requiere servidor para mostrar contenido.

## Desarrollo

Node.js 22.12 o superior y pnpm 11.25.0.

```sh
pnpm install
pnpm dev
pnpm check
pnpm build
pnpm verify
pnpm preview
```

En esta computadora también podés iniciar la vista local ejecutando `INICIAR.ps1` desde PowerShell, con las dependencias ya instaladas.

## Contenido y navegación

`source-original/` conserva los HTML del ZIP recibido. `scripts/import-content.mjs` importa textos, servicios, formulario y mapa sin ejecutar scripts originales. `src/data/es.json` y `en.json` contienen el contenido. La Home presenta una síntesis; el contenido institucional completo está en Quiénes somos y los servicios en sus páginas internas. No se crearon casos de éxito ni publicaciones ficticias.

El modo claro/oscuro sigue al sistema hasta que el usuario elige y guarda su preferencia. El logo original no se recolorea: tiene una base blanca en ambos modos. En móvil hay menú modal con manejo nativo de foco y una barra inferior con accesos rápidos. Los catálogos muestran un área por vez y permiten enlaces directos a servicios. Sin JavaScript todos los sectores y desplegables siguen disponibles.

Los dibujos técnicos y conexiones son SVG nativos. Las animaciones se ejecutan una vez al entrar en pantalla y respetan movimiento reducido. El mapa procede del ZIP: permite hover, foco, teclado, toque y selección por lista. El resaltado no afirma que GAPS haya trabajado en cada provincia; la experiencia territorial requiere validación antes de añadir corredores.

La segunda revisión incorpora trazado secuencial del hero, conexiones de capacidades con foco/hover/selección, cambio breve entre sectores, apertura y cierre animados de servicios (también al invertir rápidamente una acción), modales con entrada y salida, transiciones de tema y microinteracciones en flechas y nombres de provincias. Usa CSS y Web Animations API, sin bibliotecas adicionales. Con movimiento reducido, las acciones se resuelven directamente; si se activa durante una animación, se cancela el movimiento y se conserva el estado final.

## Administrador de contenido

Abrir `http://127.0.0.1:4321/keystatic/` con `pnpm dev` o `INICIAR.ps1`. Keystatic trabaja en modo local: los cambios se guardan en esta computadora y se ven en la web local. Todos los editores tendrán el mismo alcance de edición, sin permisos por sección. El acceso remoto del equipo todavía requiere conectar un repositorio GitHub y configurar la autenticación correspondiente; no hay usuarios remotos habilitados en esta entrega.

El panel permite editar la web en español e inglés, servicios, imágenes alternativas a los dibujos, datos de contacto y etiquetas del formulario. Casos de éxito, estudios/publicaciones y noticias cuentan con colecciones, borradores, idioma y archivos. Las entradas no marcadas como borrador generan sus páginas y sus enlaces; las colecciones vacías no agregan enlaces al menú público. Los casos se pueden filtrar por texto, sector y región. Las imágenes y PDF se guardan en `public/uploads/`; R2 todavía no está conectado.

Los textos se editan como texto simple y se muestran escapados. No hace falta escribir HTML. El logo y los colores de identidad siguen en el código, según lo acordado. El guardado conserva los campos internos originales. No volver a ejecutar los scripts de importación sobre contenido ya editado.

`pnpm verify` verifica que la compilación refleje el contenido actual. `pnpm verify:migration` compara con los textos del ZIP original y solo se usa para auditar esta migración; tras ediciones intencionales del equipo, esas diferencias son esperables.

La integración local de Keystatic se monta únicamente durante desarrollo y el servidor queda en `127.0.0.1`. La compilación estática no incluye el panel ni su API de archivos. Se aceptan rutas con y sin barra final para que la API de Keystatic funcione correctamente.

## Conexión remota

La preparación para `PibeSwitch/webgaps2` y Cloudflare Workers está documentada en `DESPLIEGUE.md`. Las variables públicas de `.env.example` seleccionan el repositorio, la aplicación de Keystatic y el dominio. `pnpm build:cloudflare` produce un artefacto separado; sin esas variables no genera una entrega remota incompleta. Los secretos se configuran en Cloudflare. El editor local sigue siendo el modo predeterminado mientras no se configure un repositorio en el entorno local.

## Contacto y siguientes fases

Se conserva la integración FormSubmit del ZIP y su dirección de destino. No se enviaron correos de prueba. La entrega real y la activación de FormSubmit requieren una prueba autorizada. R2, Resend y el acceso remoto mediante GitHub pertenecen a las fases posteriores. Cambiar el correo desde el panel puede requerir activar el nuevo destinatario en FormSubmit.

El dominio preparado en metadatos corresponde a una futura revisión privada en Sites; la web todavía no se publicó. Al pasar al dominio definitivo actualizar el origen en `src/layouts/Layout.astro`. Los redirects en `public/_redirects` preservan rutas HTML anteriores. Las fotografías originales se conservan como archivos, aunque la interfaz usa dibujos técnicos. No se usaron fuentes ni código propietarios de las referencias Pravah y Decide.

