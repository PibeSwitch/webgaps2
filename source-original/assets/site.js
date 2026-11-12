/* GAPS — interacciones del sitio. Sin dependencias. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var wide = window.matchMedia('(min-width: 901px)');

  // Menú móvil
  var btn = $('#menuButton'), nav = $('#navigation');
  var setMenu = function (open) {
    if (!btn || !nav) return;
    nav.classList.toggle('show', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? btn.getAttribute('data-close') : btn.getAttribute('data-open');
    root.classList.toggle('menu-open', open);
  };
  if (btn && nav) {
    btn.addEventListener('click', function () { setMenu(!nav.classList.contains('show')); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    wide.addEventListener('change', function () { setMenu(false); });
  }

  // Textos largos en desplegables: abiertos en escritorio, cerrados en celular
  var setDetails = function () { $$('details[data-open-desktop]').forEach(function (d) { d.open = wide.matches; }); syncToggles(); };
  var syncToggles = function () {
    $$('.acc-toggle').forEach(function (b) {
      var items = $$('details', b.closest('.detail-services'));
      var allOpen = items.every(function (d) { return d.open; });
      b.textContent = b.getAttribute(allOpen ? 'data-close' : 'data-open');
      b.setAttribute('aria-expanded', String(allOpen));
    });
  };
  $$('.acc-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var items = $$('details', b.closest('.detail-services'));
      var open = !items.every(function (d) { return d.open; });
      items.forEach(function (d) { d.open = open; });
      syncToggles();
    });
  });
  $$('details').forEach(function (d) { d.addEventListener('toggle', syncToggles); });
  setDetails();
  wide.addEventListener('change', setDetails);
  // Si se llega a un servicio por ancla, se abre
  var openTarget = function () {
    var id = location.hash.slice(1); if (!id) return;
    var el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') el.open = true;
    var inner = el && el.querySelector('details[data-open-desktop]'); if (inner && !wide.matches) inner.open = false;
  };
  openTarget(); window.addEventListener('hashchange', openTarget);

  // Subnavegación: resalta la sección visible
  var links = $$('.subnav a');
  if (links.length && 'IntersectionObserver' in window) {
    var map = links.map(function (a) { return { a: a, sec: document.getElementById(a.getAttribute('href').slice(1)) }; }).filter(function (m) { return m.sec; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        map.forEach(function (m) {
          var on = m.sec === en.target;
          m.a.classList.toggle('is-active', on);
          if (on) m.a.parentElement.scrollTo({ left: m.a.offsetLeft - 20, behavior: 'smooth' });
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach(function (m) { io.observe(m.sec); });
  }

  var year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  // Ventana de contacto: cualquier enlace a #contacto la abre
  var modal = $('#contactModal'), form = $('#contactForm');
  if (!modal || typeof modal.showModal !== 'function') return;
  var sel = $('#f-interes', form);
  var lastFocus = null;
  var openModal = function (topic) {
    lastFocus = document.activeElement;
    setMenu(false);
    if (sel && topic && sel.querySelector('option[value="' + topic + '"]')) sel.value = topic;
    modal.showModal();
    root.classList.add('modal-open');
    var first = $('#f-nombre', form); if (first && wide.matches) first.focus();
  };
  var closeModal = function () { modal.close(); };
  modal.addEventListener('close', function () { root.classList.remove('modal-open'); if (lastFocus) lastFocus.focus(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  $$('[data-close-modal]', modal).forEach(function (b) { b.addEventListener('click', closeModal); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-contact], a[href$="#contacto"]');
    if (!a || modal.contains(a)) return;
    e.preventDefault();
    openModal(a.getAttribute('data-topic'));
  });
  try {
    var q = new URLSearchParams(location.search).get('interes');
    if (q) openModal(q.replace(/[^a-z-]/g, ''));
    else if (location.hash === '#contacto') openModal();
  } catch (err) { /* sin soporte */ }

  // Formulario (FormSubmit)
  var status = $('#formStatus'), submit = $('button[type="submit"]', form);
  var attr = function (k) { return form.getAttribute('data-' + k) || ''; };
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
  var check = function (el) {
    var v = (el.value || '').trim();
    var bad = !v || (el.type === 'email' && !emailOk(v));
    el.closest('.field').classList.toggle('invalid', bad);
    el.setAttribute('aria-invalid', String(bad));
    return !bad;
  };
  var req = $$('[data-required]', form);
  req.forEach(function (el) { el.addEventListener('input', function () { if (el.closest('.field').classList.contains('invalid')) check(el); }); });
  var show = function (kind, html) { status.className = 'form-status ' + kind; status.innerHTML = html; status.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    req.forEach(function (el) { if (!check(el) && !bad) bad = el; });
    if (bad) { bad.focus(); return; }
    if ($('[name="_honey"]', form).value) return;
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    if (sel && sel.selectedIndex > 0) data.Tema = sel.options[sel.selectedIndex].text;
    delete data.interes;
    data._subject = attr('subject') + (data.Nombre ? ' · ' + data.Nombre : '');
    data._replyto = data.Email || '';
    data['Página'] = location.href;
    var label = $('span', submit), original = label.textContent;
    submit.disabled = true; label.textContent = attr('sending');
    fetch(attr('endpoint'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && (j.success === true || j.success === 'true'); }); })
      .then(function (ok) { if (ok) { form.reset(); show('ok', attr('ok')); } else show('fail', attr('fail')); })
      .catch(function () { show('fail', attr('fail')); })
      .then(function () { submit.disabled = false; label.textContent = original; });
  });
})();
