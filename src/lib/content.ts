import es from '../data/es.json';
import en from '../data/en.json';
export type Language = 'es' | 'en';
export type Page = 'home' | 'sectors' | 'specialties' | 'about' | '404' | 'cases' | 'publications' | 'news';
type Visual = { image?: string | null; imageAlt?: string; illustration: string };
type Area = Omit<typeof en.sectors.items[number], 'image' | 'imageAlt' | 'illustration'> & Visual;
type Group = { title: string; lead: string; items: Area[] };
type SiteContent = Omit<typeof en, 'hero' | 'sectors' | 'specialties'> & {
  hero: Omit<typeof en.hero, 'image' | 'imageAlt'> & { image?: string | null; imageAlt?: string };
  sectors: Group; specialties: Group;
};
// Keystatic omits empty optional fields when saving JSON.
function normalize(raw: unknown): SiteContent {
  const d = raw as SiteContent;
  const group = (value: Group): Group => ({ ...value, lead: value.lead || '', items: (value.items || []).map(item => ({ ...item, image: item.image || null, imageAlt: item.imageAlt || '', label: item.label || '', description: item.description || '', cta: item.cta || '', services: (item.services || []).map(service => ({ ...service, paragraphs: service.paragraphs || [] })) })) });
  return {
    ...d, description: d.description || '',
    hero: { ...d.hero, eyebrow: d.hero.eyebrow || '', intro: d.hero.intro || '', cta: d.hero.cta || '', secondary: d.hero.secondary || '', image: d.hero.image || null, imageAlt: d.hero.imageAlt || '', traits: d.hero.traits || [] },
    pillars: (d.pillars || []).map(pillar => ({ ...pillar, body: pillar.body || '' })),
    sections: (d.sections || []).map(section => ({ ...section, lead: section.lead || '', link: section.link || '' })),
    sectors: group(d.sectors), specialties: group(d.specialties),
    about: { ...d.about, paragraphs: d.about.paragraphs || [], callout: d.about.callout || '' },
    capabilities: { ...d.capabilities, label: d.capabilities.label || '', lead: d.capabilities.lead || '', items: d.capabilities.items || [] },
    quote: d.quote || '', contact: { ...d.contact, lead: d.contact.lead || '' },
  };
}
export const content: Record<Language, SiteContent> = { es: normalize(es), en: normalize(en) };
export const routes = {
  es: { home: '/', sectors: '/sectores/', specialties: '/especialidades/', about: '/nosotros/', '404': '/404.html', cases: '/casos/', publications: '/publicaciones/', news: '/novedades/' },
  en: { home: '/en/', sectors: '/en/sectors/', specialties: '/en/specialties/', about: '/en/about/', '404': '/en/404/', cases: '/en/cases/', publications: '/en/publications/', news: '/en/news/' },
};
export const href = (lang: Language, page: Page) => routes[lang][page];
