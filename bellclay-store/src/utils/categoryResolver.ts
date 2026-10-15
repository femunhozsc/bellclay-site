export const normalizeCategoryStr = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const resolveCategorySlug = (
  tag: string,
  categories: { name: string; slug: string }[]
): string => {
  const clean = normalizeCategoryStr(tag.replace(/^#/, ''));
  if (!clean || clean === 'produtos' || clean === 'todos' || clean === 'catalogo') {
    return 'all';
  }

  // Exact match on slug or name
  const exact = categories.find(
    (c) => normalizeCategoryStr(c.slug) === clean || normalizeCategoryStr(c.name) === clean
  );
  if (exact) return exact.slug;

  // Partial match (e.g. 'chaveiro' matches 'chaveiros', 'botton' matches 'bottons')
  const partial = categories.find(
    (c) =>
      normalizeCategoryStr(c.name).includes(clean) ||
      clean.includes(normalizeCategoryStr(c.name)) ||
      normalizeCategoryStr(c.slug).includes(clean) ||
      clean.includes(normalizeCategoryStr(c.slug))
  );
  if (partial) return partial.slug;

  return clean;
};

export const scrollToCatalogSection = () => {
  const el = document.getElementById('produtos');
  if (el) {
    const yOffset = -90; // sticky header compensation
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({
      top: Math.max(0, y),
      behavior: 'smooth'
    });
  }
};
