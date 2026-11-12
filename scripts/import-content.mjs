import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';
if (existsSync('src/data/settings.json')) throw new Error('El editor ya está configurado. Importar otra vez sobrescribiría los cambios de contenido.');

// Import only trusted text/markup from the supplied ZIP. No source scripts run.
const text = el => el?.textContent.replace(/\s+/g, ' ').trim() ?? '';
const html = el => el?.innerHTML ?? '';
const read = file => parseHTML(readFileSync(`source-original/${file}`, 'utf8')).document;
mkdirSync('src/data', { recursive: true });
for (const lang of ['es', 'en']) {
  const prefix = lang === 'en' ? 'en/' : '';
  const home = read(`${prefix}index.html`);
  const sectors = read(`${prefix}${lang === 'en' ? 'sectors' : 'sectores'}.html`);
  const specialties = read(`${prefix}${lang === 'en' ? 'specialties' : 'especialidades'}.html`);
  const group = doc => ({
    title: text(doc.querySelector('h1')),
    lead: text(doc.querySelector('.inner-lead')),
    items: [...doc.querySelectorAll('section.detail')].map(section => ({
      id: section.id,
      title: text(section.querySelector('h2')),
      label: text(section.querySelector('.kicker span')),
      description: text(section.querySelector('.desc')),
      cta: text(section.querySelector('.detail-cta a')).replace(/\s*→$/, ''),
      services: [...section.querySelectorAll('.acc-item')].map(item => ({
        id: item.id, title: text(item.querySelector('.t')),
        paragraphs: [...item.querySelectorAll('p')].map(p => text(p)),
      })),
    })),
  });
  const about = home.querySelector('.about-copy');
  const caps = home.querySelector('#capacidades');
  const form = home.querySelector('#contactForm');
  form.querySelectorAll('[id]').forEach(el => { if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.setAttribute('maxlength', el.tagName === 'TEXTAREA' ? '5000' : '254'); });
  const data = {
    lang,
    nav: [...home.querySelectorAll('.head-nav a')].map(a => text(a)),
    title: text(home.querySelector('title')),
    description: home.querySelector('meta[name="description"]').getAttribute('content'),
    hero: {
      eyebrow: text(home.querySelector('.hero .eyebrow')),
      title: lang === 'es' ? 'Personas, proyectos y desarrollo.' : 'People, projects and development.',
      intro: text(home.querySelector('.hero .intro')),
      cta: text(home.querySelector('.hero .btn-primary')).replace(/\s*→$/, ''),
      secondary: text(home.querySelector('.hero .btn-ghost')),
      traits: [...home.querySelectorAll('.traits li')].map(text),
    },
    pillars: [...home.querySelectorAll('.pillar')].map(el => ({ title: text(el.querySelector('h3')), body: text(el.querySelector('p')) })),
    sections: ['sectores', 'especialidades'].map(id => {
      const el = home.querySelector(`#${id}`) ?? home.querySelectorAll('.section-head')[id === 'sectores' ? 0 : 1]?.parentElement;
      return { title: text(el?.querySelector('.section-title')), lead: text(el?.querySelector('.section-lead')), link: text(el?.querySelector('.view-more')).replace(/\s*→$/, '') };
    }),
    sectors: group(sectors), specialties: group(specialties),
    about: { title: text(about.querySelector('h2')), paragraphs: [...about.querySelectorAll(':scope > p:not(.section-label)')].map(html), callout: html(about.querySelector('.callout')) },
    capabilities: { label: text(caps.querySelector('.section-label')), title: text(caps.querySelector('h2')), lead: text(caps.querySelector('.section-lead')), items: [...caps.querySelectorAll('.diagram-list li')].map(text) },
    quote: text(home.querySelector('blockquote')),
    contact: { title: text(home.querySelector('.cta-band h2')), lead: text(home.querySelector('.cta-band .lead')), channels: home.querySelector('.channels').outerHTML, form: form.outerHTML },
  };
  writeFileSync(`src/data/${lang}.json`, JSON.stringify(data, null, 2));
}
const map = read('index.html').querySelector('.map-box svg');
map.removeAttribute('role');
map.setAttribute('aria-label', 'Provincias de Argentina');
map.querySelectorAll('path').forEach((p, i) => {
  const name = text(p.querySelector('title'));
  p.setAttribute('tabindex', '0');
  p.setAttribute('role', 'button');
  p.setAttribute('aria-label', name);
  p.setAttribute('data-province', name);
  p.setAttribute('aria-pressed', 'false');
  p.setAttribute('id', `province-${i}`);
  p.removeAttribute('class'); // Highlight does not claim an unverified project location.
});
writeFileSync('src/data/map.svg', map.outerHTML);
console.log('Imported ES/EN, 29 service descriptions, original contact forms and 24 province shapes.');
