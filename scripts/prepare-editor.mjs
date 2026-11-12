import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';

if (existsSync('src/data/settings.json')) throw new Error('El contenido ya está preparado. No sobrescribir cambios editoriales.');
const plain = value => parseHTML(`<div>${value}</div>`).document.querySelector('div').textContent;
for (const lang of ['es', 'en']) {
  const path = `src/data/${lang}.json`;
  const d = JSON.parse(readFileSync(path, 'utf8'));
  d.about.paragraphs = d.about.paragraphs.map(plain);
  d.about.callout = plain(d.about.callout);
  d.hero.image = null;
  d.hero.imageAlt = '';
  for (const group of [d.sectors, d.specialties]) for (const item of group.items) { item.image = null; item.imageAlt = ''; item.illustration = item.id; }
  const { document } = parseHTML(d.contact.form);
  const form = document.querySelector('form');
  const fields = [...form.querySelectorAll('.field')].filter(el => !el.querySelector('select')).map(el => {
    const input = el.querySelector('input,textarea');
    return { id: input.id, name: input.getAttribute('name'), type: input.tagName === 'TEXTAREA' ? 'textarea' : input.getAttribute('type'), label: el.querySelector('label').textContent.replace(/\s+/g, ' ').trim(), placeholder: input.getAttribute('placeholder') || '', required: input.hasAttribute('required'), autocomplete: input.getAttribute('autocomplete') || '', error: el.querySelector('.err')?.textContent || '', errorId: input.getAttribute('aria-describedby') || '' };
  });
  const labels = { hint: form.querySelector('.hint').textContent, privacy: form.querySelector('.privacy').textContent, submit: form.querySelector('button span').textContent, topic: form.querySelector('label[for="f-interes"]').textContent.replace(/\s+/g, ' ').trim(), choose: form.querySelector('option').textContent, other: form.querySelector('select option:last-child').textContent, sending: form.dataset.sending, success: plain(form.dataset.ok), failure: plain(form.dataset.fail), subject: form.dataset.subject, fields };
  writeFileSync(`src/data/form-${lang}.json`, JSON.stringify(labels, null, 2));
  writeFileSync(path, JSON.stringify(d, null, 2));
}
writeFileSync('src/data/settings.json', JSON.stringify({ email: 'contacto@gapsconsultores.com.ar', phone: '+54 9 11 6246-6346', whatsapp: '5491162466346', whatsappMessageEs: 'Hola, les escribo desde el sitio web de GAPS.', whatsappMessageEn: 'Hello, I’m reaching out from the GAPS website.', linkedin: 'https://www.linkedin.com/company/gaps-consultores', linkedinName: 'GAPS Consultores', location: 'Buenos Aires, Argentina' }, null, 2));
console.log('Contenido preparado para Keystatic sin modificar los textos institucionales.');
