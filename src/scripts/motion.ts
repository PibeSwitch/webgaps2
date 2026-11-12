// Native browser animations, shared by pointer, keyboard and touch interactions.
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const active = new WeakMap<Element, Animation>();

export function animate(element: Element, frames: Keyframe[], duration = 220, delay = 0) {
  active.get(element)?.cancel();
  if (reducedMotion.matches || typeof element.animate !== 'function') return undefined;
  const animation = element.animate(frames, { duration, delay, easing: 'cubic-bezier(.2,.7,.2,1)' });
  active.set(element, animation);
  void animation.finished.catch(() => {}).finally(() => { if (active.get(element) === animation) active.delete(element); });
  return animation;
}

// Cancelling returns every element to its final, readable CSS state.
reducedMotion.addEventListener('change', event => { if (event.matches) document.getAnimations().forEach(animation => animation.cancel()); });

const disclosures = new WeakMap<HTMLDetailsElement, { animation?: Animation; desired: boolean }>();
export function setServiceOpen(details: HTMLDetailsElement, open: boolean) {
  const state = disclosures.get(details);
  if (state?.desired === open && state.animation?.playState === 'running') return;
  if (!state?.animation && details.open === open) return;
  const start = details.getBoundingClientRect().height;
  state?.animation?.cancel();
  const body = details.querySelector<HTMLElement>('.service-body')!;
  const summary = details.querySelector<HTMLElement>('summary')!;
  const next: { animation?: Animation; desired: boolean } = { desired: open };
  disclosures.set(details, next);
  details.dataset.expanded = String(open);
  body.inert = !open;
  const finish = () => {
    if (disclosures.get(details) !== next) return;
    details.open = open;
    details.style.removeProperty('overflow');
    delete details.dataset.expanded;
    body.inert = false;
    disclosures.delete(details);
  };
  if (reducedMotion.matches) { finish(); return; }
  // Keep native details open until closing finishes so the body remains measurable.
  details.open = true;
  const end = open ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height;
  details.style.overflow = 'hidden';
  next.animation = animate(details, [{ height: `${start}px` }, { height: `${end}px` }], 240);
  if (next.animation) void next.animation.finished.catch(() => {}).finally(finish);
  else finish();
}

export function toggleService(details: HTMLDetailsElement) {
  setServiceOpen(details, !(disclosures.get(details)?.desired ?? details.open));
}

const closing = new WeakMap<HTMLDialogElement, Promise<void>>();
export function openDialog(dialog: HTMLDialogElement) {
  if (dialog.open) return;
  dialog.showModal();
  const side = dialog.id === 'mobile-menu';
  animate(dialog, [
    { opacity: 0, transform: side ? 'translateX(24px)' : 'translateY(16px)' },
    { opacity: 1, transform: 'translate(0)' },
  ], 220);
}

export function closeDialog(dialog: HTMLDialogElement): Promise<void> {
  if (closing.has(dialog)) return closing.get(dialog)!;
  if (!dialog.open) return Promise.resolve();
  const side = dialog.id === 'mobile-menu';
  const current = getComputedStyle(dialog);
  const animation = animate(dialog, [
    { opacity: current.opacity, transform: current.transform },
    { opacity: 0, transform: side ? 'translateX(18px)' : 'translateY(12px)' },
  ], 160);
  const finished = (animation?.finished ?? Promise.resolve()).catch(() => {}).then(() => {
    dialog.close(); closing.delete(dialog);
  });
  closing.set(dialog, finished);
  return finished;
}
