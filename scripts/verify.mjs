import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { parseHTML } from 'linkedom';

const normalize = value => value.replace(/\s+/g, ' ').trim();
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const pages = walk('dist').filter(p => p.endsWith('.html'));
const documents = new Map(pages.map(path => [path.replaceAll('\\', '/'), parseHTML(readFileSync(path, 'utf8')).document]));
const originalMode = process.argv.includes('--original');
let serviceCount = 0;
for (const lang of ['es', 'en']) {
  const prefix = lang === 'en' ? 'en/' : '';
  const data = JSON.parse(readFileSync(`src/data/${lang}.json`, 'utf8'));
  for (const key of ['sectors', 'specialties']) {
    const name = lang === 'es' ? (key === 'sectors' ? 'sectores' : 'especialidades') : key;
    const original = parseHTML(readFileSync(`source-original/${prefix}${name}.html`, 'utf8')).document;
    const built = documents.get(`dist/${prefix}${name}/index.html`);
    assert(built, `Missing ${lang}/${name}`);
    const expectedSections = originalMode ? [...original.querySelectorAll('section.detail')].map(section => ({ id: section.id, title: section.querySelector('h2').textContent, description: section.querySelector('.desc').textContent, services: [...section.querySelectorAll('.acc-item')].map(service => ({ id: service.id, title: service.querySelector('.t').textContent, paragraphs: [...service.querySelectorAll('p')].map(p => p.textContent) })) })) : data[key].items;
    for (const section of expectedSections) {
      const migrated = built.getElementById(section.id);
      assert(migrated, `Missing section ${section.id}`);
      assert.equal(normalize(migrated.querySelector('.panel-intro h2').textContent), normalize(section.title));
      assert.equal(normalize(migrated.querySelector('.panel-intro p:not(.eyebrow)').textContent), normalize(section.description || ''));
      for (const originalService of section.services || []) {
        const migratedService = built.getElementById(originalService.id);
        assert(migratedService, `Missing ${originalService.id}`);
        assert.equal(normalize(migratedService.querySelector('summary > span:nth-child(2)').textContent), normalize(originalService.title));
        assert.deepEqual([...migratedService.querySelectorAll('.service-body p')].map(p => normalize(p.textContent)), (originalService.paragraphs || []).map(normalize));
        assert(!migratedService.hasAttribute('open'), 'Services must start closed');
        serviceCount++;
      }
    }
    if (originalMode) assert.equal(data[key].items.length, key === 'sectors' ? 3 : 4);
  }
  const aboutPath = lang === 'es' ? 'dist/nosotros/index.html' : 'dist/en/about/index.html';
  const about = documents.get(aboutPath);
  assert.equal(about.querySelectorAll('[data-province]').length, 24);
  for (const shape of about.querySelectorAll('[data-province]')) assert(shape.getAttribute('aria-label') && shape.getAttribute('tabindex') === '0');
  const originalHome = parseHTML(readFileSync(`source-original/${prefix}index.html`, 'utf8')).document;
  const allText = [...documents.values()].filter(doc => doc.documentElement.lang === lang).map(doc => normalize(doc.body.textContent)).join(' ');
  const institutional = originalMode ? [...originalHome.querySelectorAll('.about-copy > p:not(.section-label), .callout, blockquote, .diagram-list li, .pillar p, .traits li')].map(p => p.textContent) : [...(data.about.paragraphs || []), data.about.callout || '', data.quote || '', ...(data.capabilities.items || []), ...(data.pillars || []).map(p => p.body || ''), ...(data.hero.traits || [])];
  for (const copy of institutional) assert(allText.includes(normalize(copy)), `Missing institutional copy: ${normalize(copy)}`);
}
for (const [path, doc] of documents) {
  assert.equal(doc.querySelectorAll('h1').length, 1, `${path}: one h1`);
  const ids = [...doc.querySelectorAll('[id]')].map(el => el.id);
  assert.equal(ids.length, new Set(ids).size, `${path}: duplicate IDs`);
  for (const el of doc.querySelectorAll('[href], [src]')) {
    const raw = el.getAttribute('href') ?? el.getAttribute('src');
    if (!raw || !raw.startsWith('/') && !raw.startsWith('#')) continue;
    const [pathname, hash] = raw.split('#');
    const target = pathname ? `dist${pathname.endsWith('/') ? pathname + 'index.html' : pathname}` : path;
    assert(existsSync(target), `${path}: broken local reference ${raw}`);
    if (hash) assert(documents.get(target)?.getElementById(decodeURIComponent(hash)), `${path}: broken anchor ${raw}`);
  }
  const form = doc.querySelector('#contactForm');
  assert(form.getAttribute('data-endpoint').startsWith('https://formsubmit.co/ajax/'));
  assert(form.querySelector('[name="_honey"]'));
}
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
assert.equal(sha('public/assets/gaps-logo.png'), sha('dist/assets/gaps-logo.png'));
if (originalMode) assert.equal(serviceCount, 58);
assert(!existsSync('dist/keystatic'), 'El editor local no debe incluirse en la web estática.');
assert(!existsSync('dist/api/keystatic'), 'La API de archivos local no debe publicarse.');
console.log(`PASS: ${pages.length} pages; ${serviceCount} ES/EN service titles and descriptions match ${originalMode ? 'the original ZIP' : 'current editor content'}; institutional copy, links, anchors, logo, forms, 24 provinces, and static editor exclusion checked.`);
