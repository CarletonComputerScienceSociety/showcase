import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const members = await getCollection('webring');

  // Build `ring` from `members`:
  //   - .filter() to keep only inRing === true
  //   - .sort() by graduation year ascending, then name as a stable tiebreak
  //     (year difference, falling back to localeCompare on name)
  //   - .map() each down to just { name, url }
  // This order defines prev/next traversal in the embed — keep it deterministic.
  const ring = members
    .filter((member) => member.data.inRing)
    .sort((a, b) => {
      if (a.data.year < b.data.year) return -1;
      if (a.data.year > b.data.year) return 1;

      return a.data.name.localeCompare(b.data.name);
    })
    .map((member) => {
      return {
        name: member.data.name,
        url: member.data.url,
      };
    });

  return new Response(JSON.stringify(ring, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
