import type { Language } from './content';

export type Category = 'cases' | 'publications' | 'news';
export interface EditorialEntry {
  title: string; language: Language; draft: boolean; date?: string | null; summary: string;
  slug: string; category: Category; region?: string[]; sector?: string;
  challenge?: string; solution?: string; results?: string; body?: string; authors?: string;
  image?: string | null; imageAlt?: string; pdf?: string | null;
  photos?: { image: string | null; alt: string; caption: string }[];
}
const sources = {
  cases: import.meta.glob('../content/cases/*.json', { eager: true, import: 'default' }),
  publications: import.meta.glob('../content/publications/*.json', { eager: true, import: 'default' }),
  news: import.meta.glob('../content/news/*.json', { eager: true, import: 'default' }),
};
export const editorialLabels = {
  es: { cases: 'Casos de éxito', publications: 'Estudios y publicaciones', news: 'Noticias y novedades' },
  en: { cases: 'Case studies', publications: 'Studies and publications', news: 'News and updates' },
};
export function entries(lang: Language, category: Category): EditorialEntry[] {
  return Object.entries(sources[category]).flatMap(([path, value]) => {
    const item = value as EditorialEntry;
    if (item.language !== lang || item.draft !== false) return [];
    return [{ ...item, slug: path.split('/').pop()!.replace(/\.json$/, ''), category }];
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}
export function publishedLinks(lang: Language) {
  return (['cases', 'publications', 'news'] as const).filter(category => entries(lang, category).length > 0);
}
