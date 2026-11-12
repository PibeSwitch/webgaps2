# Validación de la primera versión

- Astro check: 0 errores, 0 advertencias, 0 sugerencias.
- Compilación estática: 10 páginas, español e inglés, incluidas páginas 404.
- Verificación de contenido: 58 títulos y descripciones de servicios cotejados con los originales (29 por idioma); textos institucionales conservados.
- Referencias locales: enlaces, anclas, archivos y ausencia de identificadores duplicados comprobados automáticamente.
- Mapa: 24 jurisdicciones del SVG original con etiquetas accesibles, teclado y selector alternativo.
- Navegador: navegación de sectores, cambio de panel, desplegables inicialmente cerrados, menú modal móvil, contacto desde el menú, validación de campos vacíos y devolución de foco al cerrar.
- Modo claro/oscuro y persistencia entre páginas comprobados. Fuente real cargada: IBM Plex Sans.
- Anchuras comprobadas: 320, 390 y 1440 píxeles. Se corrigió el desborde encontrado en tarjetas a 320 px; ancho de documento final igual a ancho disponible.
- Selección de Córdoba comprobada en el mapa, con actualización de nombre y forma resaltada.
- Sin errores en consola durante la revisión.
- No se envió un formulario con datos reales. La entrega de correos no está validada.
- Keystatic, R2 y Resend no forman parte de esta primera entrega.
- Publicación externa pendiente: no se sincronizó el código con el repositorio remoto. La vista previa es local.

Las advertencias de empaquetado sobre comentarios PURE en la dependencia Zod no impidieron la compilación y no son errores del sitio.

## Revisión 02 · Animaciones

- Apertura y cierre de servicios, inversión con varios clics y limpieza final de altura/overflow comprobados en navegador.
- Abrir/cerrar todos y cambio de sector comprobados.
- Menú móvil con cierre Escape y devolución del foco; formulario con entrada/salida comprobados.
- Selección de un nodo activa su conexión; el foco de teclado en el nodo siguiente actualiza la conexión resaltada.
- Sin errores de consola durante estas interacciones.
- La alternativa de movimiento reducido está implementada en CSS y JavaScript; no se cambió la configuración del sistema para probarla.
- La revisión se mantiene local. No hubo nuevas solicitudes de publicación externa.

## Revisión 03 · Administrador local

- Keystatic configurado con cinco entradas institucionales y tres colecciones. Todos los editores comparten el mismo alcance de edición.
- Se comprobó lectura y guardado real desde el navegador. El título usado en la prueba se restauró; los textos y servicios originales se conservaron. Se contempló que Keystatic omite los campos opcionales vacíos.
- Se creó una novedad temporal desde el panel: como borrador no apareció en la web; al desmarcar borrador generó su listado y artículo local con respuesta 200. La entrada temporal se eliminó después de comprobarlo.
- El panel y su API local quedan excluidos de la compilación estática.
- Las cargas de imágenes y PDF están configuradas; no se probaron con archivos de proyectos reales.
- GitHub, usuarios remotos, R2 y Resend siguen pendientes. No se publicó contenido fuera de esta computadora.

## Revisión 04 · Preparación GitHub y Cloudflare

- Repositorio seleccionado por el usuario: `PibeSwitch/webgaps2`, inicialmente vacío y público. El conector confirmó permisos de administración y escritura.
- Compilación estática y auditoría de los 58 servicios ES/EN aprobadas.
- Compilación Cloudflare Workers aprobada con variables temporales de prueba. Se mantienen separados los artefactos locales y los de Cloudflare.
- Worker ejecutado localmente: Home ES/EN y administrador respondieron 200. El administrador devuelve `no-store` y `noindex, nofollow`.
- En modo GitHub, la ruta de lectura de archivos locales `/api/keystatic/tree` respondió 404 al probar con bindings ficticios. No se probaron OAuth ni guardados remotos con credenciales reales.
- La compilación remota se detiene si faltan repositorio, nombre de aplicación o dominio HTTPS.
- La sesión de Wrangler estaba vencida: no se ejecutó un despliegue real. Resta renovar Cloudflare, crear/autorizar la GitHub App de Keystatic y configurar sus secretos.
