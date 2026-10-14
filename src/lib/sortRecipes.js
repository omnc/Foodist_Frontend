export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Rating' },
  { value: 'title', label: 'Title' },
];

/** Returns a sorted copy: newest first (default), highest rated first, or A to Z by title. */
export function sortRecipes(recipes, sort) {
  const next = [...recipes];
  if (sort === 'rating') return next.sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0));
  if (sort === 'title') return next.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  return next.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}
