import { animate, closeDialog, openDialog, reducedMotion, setServiceOpen, toggleService } from './motion';

const es = document.body.dataset.language === 'es';
const root = document.documentElement;
const theme = document.querySelector<HTMLButtonElement>('.theme-toggle');
const darkMedia = matchMedia('(prefers-color-scheme: dark)');
let explicitTheme = false;
try { explicitTheme = ['dark', 'light'].includes(localStorage.getItem('gaps-theme') ?? ''); } catch {}
function syncTheme() {
  const dark = root.dataset.theme === 'dark';
  const label = es ? `Cambiar a modo ${dark ? 'claro' : 'oscuro'}` : `Switch to ${dark ? 'light' : 'dark'} mode`;
  theme?.setAttribute('aria-label', label);
  theme?.setAttribute('title', label);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#141216' : '#ffffff');
}
theme?.addEventListener('click', () => {
  root.classList.add('theme-transition');
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  explicitTheme = true;
  try { localStorage.setItem('gaps-theme', root.dataset.theme); } catch {}
  syncTheme();
  setTimeout(() => root.classList.remove('theme-transition'), 280);
});
darkMedia.addEventListener('change', e => { if (!explicitTheme) { root.dataset.theme = e.matches ? 'dark' : 'light'; syncTheme(); } });
syncTheme();

const menu = document.querySelector<HTMLDialogElement>('#mobile-menu')!;
const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-open]')!;
const contact = document.querySelector<HTMLDialogElement>('#contact-modal')!;
function lockScroll() { root.classList.toggle('dialog-open', Boolean(document.querySelector('dialog[open]'))); }
menuButton.addEventListener('click', () => { openDialog(menu); menuButton.setAttribute('aria-expanded', 'true'); lockScroll(); });
document.querySelector('[data-menu-close]')?.addEventListener('click', () => { void closeDialog(menu); });
menu.addEventListener('close', () => { menuButton.setAttribute('aria-expanded', 'false'); lockScroll(); });
menu.querySelectorAll('a:not([data-contact])').forEach(a => a.addEventListener('click', () => { void closeDialog(menu); }));
matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches && menu.open) menu.close(); });
for (const dialog of [menu, contact]) {
  dialog.addEventListener('cancel', e => { e.preventDefault(); void closeDialog(dialog); });
  dialog.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) void closeDialog(dialog); } });
}
let contactTrigger: HTMLElement | null = null;
document.querySelectorAll<HTMLAnchorElement>('[data-contact]').forEach(a => a.addEventListener('click', async e => {
  e.preventDefault();
  contactTrigger = a;
  if (menu.open) await closeDialog(menu);
  const select = document.querySelector<HTMLSelectElement>('#f-interes');
  if (select) select.value = a.dataset.topic ?? '';
  openDialog(contact); lockScroll();
}));
document.querySelector('[data-contact-close]')?.addEventListener('click', () => { void closeDialog(contact); });
contact.addEventListener('close', () => { lockScroll(); if (contactTrigger?.isConnected) { if (contactTrigger.closest('#mobile-menu')) menuButton.focus(); else contactTrigger.focus(); } });

// Native anchors and details work without JavaScript. With JS, show one area at a time.
const catalogue = document.querySelector<HTMLElement>('[data-catalogue]');
if (catalogue) {
  const panels = [...catalogue.querySelectorAll<HTMLElement>('[data-panel]')];
  const links = [...catalogue.querySelectorAll<HTMLAnchorElement>('[data-panel-link]')];
  const select = catalogue.querySelector<HTMLSelectElement>('[data-panel-select]')!;
  function selectPanel(id: string, shouldScroll = false) {
    const target = document.getElementById(id);
    const chosen = target?.closest<HTMLElement>('[data-panel]') ?? panels[0];
    const previous = panels.find(panel => !panel.hidden);
    panels.forEach(panel => panel.hidden = panel !== chosen);
    if (catalogue?.classList.contains('is-enhanced') && previous !== chosen) animate(chosen, [{ opacity: .25, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], 220);
    links.forEach(link => { if (link.dataset.panelLink === chosen.id) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current'); });
    select.value = chosen.id;
    const languageLink = document.querySelector<HTMLAnchorElement>('.language-link');
    if (languageLink) languageLink.hash = target?.id || chosen.id;
    if (target instanceof HTMLDetailsElement) target.open = true;
    if (shouldScroll) (target ?? chosen).scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  function fromHash(scroll = false) { selectPanel(decodeURIComponent(location.hash.slice(1)), scroll); }
  links.forEach(link => link.addEventListener('click', e => { e.preventDefault(); history.pushState(null, '', link.hash); selectPanel(link.dataset.panelLink!, false); }));
  select.addEventListener('change', () => { history.pushState(null, '', `#${select.value}`); selectPanel(select.value); });
  window.addEventListener('hashchange', () => fromHash(true));
  window.addEventListener('popstate', () => fromHash());
  fromHash();
  catalogue.classList.add('is-enhanced');
  if (location.hash) requestAnimationFrame(() => fromHash(true));
  catalogue.querySelectorAll<HTMLElement>('[data-panel]').forEach(panel => {
    const all = panel.querySelector<HTMLButtonElement>('[data-expand-all]')!;
    const services = [...panel.querySelectorAll<HTMLDetailsElement>('details.service')];
    const update = () => { const open = services.every(item => item.dataset.expanded === 'true' || (item.dataset.expanded !== 'false' && item.open)); all.textContent = es ? (open ? 'Cerrar todos' : 'Abrir todos') : (open ? 'Collapse all' : 'Expand all'); all.setAttribute('aria-expanded', String(open)); };
    all.addEventListener('click', () => { const open = !services.every(item => item.dataset.expanded === 'true' || (item.dataset.expanded !== 'false' && item.open)); services.forEach(item => setServiceOpen(item, open)); update(); });
    services.forEach(item => {
      item.querySelector('summary')?.addEventListener('click', e => { e.preventDefault(); toggleService(item); });
      item.addEventListener('toggle', update);
    }); update();
  });
}

// One drawing sequence on entering the viewport; no perpetual motion.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.2 });
  document.querySelectorAll('[data-network], [data-capabilities]').forEach(el => observer.observe(el));
}
document.querySelectorAll<HTMLElement>('[data-capabilities]').forEach(network => {
  const buttons = [...network.querySelectorAll<HTMLButtonElement>('[data-node]')];
  let preview: string | undefined;
  let selected: string | undefined;
  function render() {
    const shown = preview ?? selected;
    network.classList.toggle('has-active-node', shown !== undefined);
    buttons.forEach(button => {
      button.classList.toggle('is-active', button.dataset.node === shown);
      button.setAttribute('aria-pressed', String(button.dataset.node === selected));
    });
    network.querySelectorAll('[data-connection]').forEach(path => path.classList.toggle('selected', path.getAttribute('data-connection') === shown));
  }
  function highlight(button: HTMLButtonElement) {
    selected = selected === button.dataset.node ? undefined : button.dataset.node;
    render();
  }
  buttons.forEach(button => {
    button.addEventListener('click', () => highlight(button));
    button.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { preview = button.dataset.node; render(); } });
    button.addEventListener('pointerleave', () => { preview = undefined; render(); });
    button.addEventListener('focus', () => { preview = button.dataset.node; render(); });
    button.addEventListener('blur', () => { preview = undefined; render(); });
  });
});

document.querySelectorAll<HTMLElement>('[data-map]').forEach(map => {
  const shapes = [...map.querySelectorAll<SVGPathElement>('[data-province]')];
  const output = map.querySelector<HTMLOutputElement>('[data-province-name]')!;
  const select = map.querySelector<HTMLSelectElement>('[data-province-select]')!;
  function highlight(name: string) {
    shapes.forEach(shape => { const selected = shape.dataset.province === name; shape.classList.toggle('selected', selected); shape.setAttribute('aria-pressed', String(selected)); });
    const next = name || (es ? 'Seleccioná una provincia.' : 'Select a province.');
    if (output.textContent !== next) {
      output.textContent = next;
      animate(output, [{ opacity: .25, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }], 160);
    }
    select.value = name;
  }
  shapes.forEach(shape => {
    shape.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') highlight(shape.dataset.province!); });
    shape.addEventListener('focus', () => highlight(shape.dataset.province!));
    shape.addEventListener('click', () => highlight(shape.dataset.province!));
    shape.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); highlight(shape.dataset.province!); } });
  });
  select.addEventListener('change', () => highlight(select.value));
});

document.querySelectorAll<HTMLElement>('[data-editorial]').forEach(section => {
  const search = section.querySelector<HTMLInputElement>('[data-entry-search]');
  const sector = section.querySelector<HTMLSelectElement>('[data-entry-sector]');
  const region = section.querySelector<HTMLSelectElement>('[data-entry-region]');
  const cards = [...section.querySelectorAll<HTMLElement>('[data-entry]')];
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const update = () => {
    cards.forEach(card => {
      card.hidden = !(normalize(card.dataset.search || '').includes(normalize(search?.value.trim() || '')) && (!sector?.value || card.dataset.sector === sector.value) && (!region?.value || JSON.parse(card.dataset.regions || '[]').includes(region.value)));
    });
    const empty = section.querySelector<HTMLElement>('[data-entry-empty]');
    if (empty) empty.hidden = cards.some(card => !card.hidden);
  };
  search?.addEventListener('input', update); sector?.addEventListener('change', update); region?.addEventListener('change', update);
});

// Keep the original FormSubmit integration until the separate Resend phase.
const form = document.querySelector<HTMLFormElement>('#contactForm');
if (form) {
  const status = form.querySelector<HTMLElement>('#formStatus')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const required = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-required]')];
  const validate = (input: HTMLInputElement | HTMLTextAreaElement) => {
    const invalid = !input.value.trim() || !input.validity.valid;
    input.closest('.field')?.classList.toggle('invalid', invalid);
    input.setAttribute('aria-invalid', String(invalid));
    return !invalid;
  };
  required.forEach(input => input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validate(input); }));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const checks = required.map(input => validate(input));
    if (checks.includes(false)) { required[checks.indexOf(false)].focus(); return; }
    if ((form.elements.namedItem('_honey') as HTMLInputElement)?.value) return;
    const data: Record<string, FormDataEntryValue> = Object.fromEntries(new FormData(form));
    const topic = form.querySelector<HTMLSelectElement>('#f-interes');
    if (topic?.value) data.Tema = topic.options[topic.selectedIndex].text;
    delete data.interes;
    data._subject = `${form.dataset.subject || (es ? 'Consulta web' : 'Website inquiry')} · ${data.Nombre}`;
    data._replyto = data.Email;
    data['Página'] = location.href;
    const label = submit.querySelector('span')!;
    const original = label.textContent;
    submit.disabled = true; label.textContent = form.dataset.sending ?? ''; status.textContent = ''; status.className = 'form-status';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.dataset.endpoint!, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data), signal: controller.signal });
      const result = await response.json();
      if (!response.ok || ![true, 'true'].includes(result.success)) throw new Error('Form submission failed');
      form.reset(); status.classList.add('ok'); status.innerHTML = form.dataset.ok!;
    } catch { status.classList.add('fail'); status.innerHTML = form.dataset.fail!; }
    finally { clearTimeout(timeout); submit.disabled = false; label.textContent = original; }
  });
}
