import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
type Category = 'All rituals' | 'Massage' | 'Body' | 'Face';
export default function CatalogFilter({ total }: { total: number }) {
  const [active, setActive] = useState<Category>('All rituals');
  const [count, setCount] = useState(total);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('[data-treatment-category]');
    let visible = 0;
    cards.forEach(card => { const show = active === 'All rituals' || card.dataset.treatmentCategory === active; card.hidden = !show; if (show) visible++; });
    setCount(visible);
    return () => cards.forEach(card => { card.hidden = false; });
  }, [active]);
  return <div className="catalog-filter" hidden={!ready}>
    <div className="filter-options" role="group" aria-label="Filter treatments by category">
      {(['All rituals', 'Massage', 'Body', 'Face'] as const).map(category => <Button key={category} variant="ghost" className="filter-button" aria-pressed={category === active} onClick={() => setActive(category)}>{category}</Button>)}
    </div>
    <p className="filter-result" aria-live="polite" aria-atomic="true">{count} {count === 1 ? 'ritual' : 'rituals'} to explore</p>
  </div>;
}
