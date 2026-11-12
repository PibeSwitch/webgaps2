import { config, fields, singleton, collection } from '@keystatic/core';

// Modo del panel: Keystatic Cloud si hay proyecto (lo usa la publicación en Cloudflare), GitHub si hay repositorio, si no, local.
const cloudProject = import.meta.env.PUBLIC_KEYSTATIC_CLOUD_PROJECT?.trim();
const repository = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO?.trim();
const githubMode = !cloudProject && !!repository;
if (repository && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error('El repositorio de GitHub debe tener el formato cuenta/repositorio.');
const [owner, name] = (repository || '').split('/');

const text = (label: string, multiline = false) => fields.text({ label, multiline });
const required = (label: string) => fields.text({ label, validation: { isRequired: true } });
const texts = (label: string) => fields.array(text('Texto', true), { label, itemLabel: p => p.value.slice(0, 65) || 'Nuevo texto' });
const picture = (label: string) => fields.image({ label, directory: 'public/uploads/images', publicPath: '/uploads/images/', validation: { isRequired: false } });
const illustrationOptions = [
  { label: 'Productivo', value: 'productivo' }, { label: 'Urbano', value: 'urbano' },
  { label: 'Infraestructura', value: 'infraestructura' }, { label: 'Estrategia', value: 'estrategia' },
  { label: 'Organización', value: 'organizacion' }, { label: 'Proyectos', value: 'proyectos' },
  { label: 'Estructuración', value: 'estructuracion' },
];
const services = fields.array(fields.object({
  id: required('Nombre en el enlace (sin espacios)'), title: required('Servicio'), paragraphs: texts('Descripción'),
}), { label: 'Servicios', itemLabel: p => p.fields.title.value || 'Nuevo servicio' });
const areas = (label: string) => fields.object({
  title: required('Título de la página'), lead: text('Introducción', true),
  items: fields.array(fields.object({
    id: required('Nombre en el enlace (sin espacios)'), label: fields.ignored(),
    title: required('Nombre'), description: text('Descripción', true), cta: text('Botón de contacto'),
    illustration: fields.select({ label: 'Dibujo', options: illustrationOptions, defaultValue: 'productivo' }),
    image: picture('Imagen alternativa al dibujo (opcional)'), imageAlt: text('Descripción accesible de la imagen'), services,
  }), { label, itemLabel: p => p.fields.title.value || 'Nueva área', validation: { length: { min: 1 } } }),
}, { label });

const siteSchema = {
  lang: fields.ignored(),
  title: required('Título para buscadores'), description: text('Descripción para buscadores', true),
  nav: fields.array(required('Nombre de sección'), { label: 'Menú: sectores, especialidades, quiénes somos y contacto', itemLabel: p => p.value, validation: { length: { min: 4, max: 4 } } }),
  hero: fields.object({
    eyebrow: text('Presentación'), title: required('Título principal'), intro: text('Introducción', true),
    cta: text('Botón de contacto'), secondary: text('Botón de sectores'),
    traits: fields.array(required('Rasgo'), { label: 'Rasgos de GAPS', validation: { length: { min: 1 } }, itemLabel: p => p.value }),
    image: picture('Imagen alternativa al esquema de conexiones (opcional)'), imageAlt: text('Descripción accesible de la imagen'),
  }, { label: 'Inicio · Presentación' }),
  pillars: fields.array(fields.object({ title: required('Título'), body: text('Texto', true) }), { label: 'Territorio, alianzas y resultados', itemLabel: p => p.fields.title.value }),
  sections: fields.array(fields.object({ title: required('Título'), lead: text('Introducción', true), link: text('Enlace') }), { label: 'Inicio · Sectores y especialidades', itemLabel: p => p.fields.title.value, validation: { length: { min: 2, max: 2 } } }),
  sectors: areas('Sectores'), specialties: areas('Especialidades'),
  about: fields.object({ title: required('Título'), paragraphs: texts('Párrafos'), callout: text('Texto destacado', true) }, { label: 'Quiénes somos' }),
  capabilities: fields.object({ label: text('Presentación'), title: required('Título'), lead: text('Introducción', true), items: fields.array(required('Capacidad'), { label: 'Nodos del diagrama', validation: { length: { min: 1, max: 7 } }, itemLabel: p => p.value }) }, { label: 'Integración de capacidades' }),
  quote: text('Cita destacada', true),
  contact: fields.object({ title: required('Título'), lead: text('Introducción', true), channels: fields.ignored(), form: fields.ignored() }, { label: 'Contacto' }),
};
const formSchema = {
  hint: text('Aclaración de campos obligatorios'), privacy: text('Privacidad', true), submit: text('Botón de envío'),
  topic: text('Pregunta sobre el tema'), choose: text('Opción inicial'), other: text('Otro tema'), sending: text('Mensaje durante el envío'),
  success: text('Mensaje de envío exitoso', true), failure: text('Mensaje de error', true), subject: text('Asunto del correo'),
  fields: fields.array(fields.object({ id: fields.ignored(), name: fields.ignored(), type: fields.ignored(), label: required('Etiqueta'), placeholder: text('Texto de ayuda'), required: fields.checkbox({ label: 'Obligatorio' }), autocomplete: fields.ignored(), error: text('Mensaje de validación'), errorId: fields.ignored() }), { label: 'Campos del formulario', itemLabel: p => p.fields.label.value, validation: { length: { min: 5, max: 5 } } }),
};
const language = fields.select({ label: 'Idioma', options: [{ label: 'Español', value: 'es' }, { label: 'English', value: 'en' }], defaultValue: 'es' });
const base = {
  title: fields.slug({ name: { label: 'Título', validation: { isRequired: true } } }),
  language,
  draft: fields.checkbox({ label: 'Borrador (no mostrar en la web)', defaultValue: true }),
  date: fields.date({ label: 'Fecha' }),
  summary: fields.text({ label: 'Resumen', multiline: true, validation: { isRequired: true } }),
};
export default config({
  locale: 'es-ES',
  storage: cloudProject ? { kind: 'cloud' } : githubMode ? { kind: 'github', repo: { owner, name } } : { kind: 'local' },
  ...(cloudProject ? { cloud: { project: cloudProject } } : {}),
  ui: { brand: { name: 'GAPS · Administración' }, navigation: { 'Contenido institucional': ['siteEs', 'siteEn', 'settings', 'formEs', 'formEn'], 'Casos y conocimiento': ['cases', 'publications', 'news'] } },
  singletons: {
    siteEs: singleton({ label: 'Web · Español', path: 'src/data/es', format: { data: 'json' }, schema: siteSchema }),
    siteEn: singleton({ label: 'Web · English', path: 'src/data/en', format: { data: 'json' }, schema: siteSchema }),
    formEs: singleton({ label: 'Formulario · Español', path: 'src/data/form-es', format: { data: 'json' }, schema: formSchema }),
    formEn: singleton({ label: 'Formulario · English', path: 'src/data/form-en', format: { data: 'json' }, schema: formSchema }),
    settings: singleton({ label: 'Datos de contacto', path: 'src/data/settings', format: { data: 'json' }, schema: {
      email: required('Correo'), phone: required('Teléfono visible'), whatsapp: required('Número de WhatsApp (solo dígitos)'),
      whatsappMessageEs: text('Mensaje inicial de WhatsApp · Español'), whatsappMessageEn: text('Mensaje inicial de WhatsApp · English'),
      linkedin: fields.url({ label: 'LinkedIn' }), linkedinName: text('Nombre en LinkedIn'), location: text('Ubicación'),
    } }),
  },
  collections: {
    cases: collection({ label: 'Casos de éxito', path: 'src/content/cases/*', slugField: 'title', format: { data: 'json' }, schema: {
      ...base, region: texts('Provincia o región'),
      sector: fields.select({ label: 'Sector', options: illustrationOptions.slice(0, 3), defaultValue: 'productivo' }),
      challenge: text('Desafío', true), solution: text('Solución', true), results: text('Resultados', true),
      photos: fields.array(fields.object({ image: picture('Foto'), alt: text('Descripción accesible'), caption: text('Epígrafe') }), { label: 'Fotos', itemLabel: p => p.fields.caption.value || 'Foto' }),
    } }),
    publications: collection({ label: 'Estudios y publicaciones', path: 'src/content/publications/*', slugField: 'title', format: { data: 'json' }, schema: {
      ...base, authors: text('Autoría'), body: text('Presentación del estudio', true), image: picture('Portada'), imageAlt: text('Descripción de la portada'),
      pdf: fields.file({ label: 'Archivo PDF', directory: 'public/uploads/publications', publicPath: '/uploads/publications/' }),
    } }),
    news: collection({ label: 'Noticias y novedades', path: 'src/content/news/*', slugField: 'title', format: { data: 'json' }, schema: {
      ...base, body: fields.text({ label: 'Cuerpo de la noticia', multiline: true, validation: { isRequired: true } }), image: picture('Imagen'), imageAlt: text('Descripción accesible de la imagen'),
    } }),
  },
});
