import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Button } from '@/components/ui/button';
export interface GalleryItem { id: string; src: string; width: number; height: number; alt: string; label: string }
export default function GalleryLightbox({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const previousTrigger = useRef<HTMLAnchorElement | null>(null);
  const count = items.length;
  const move = (step: number) => setIndex(current => current === null ? null : (current + step + count) % count);
  useEffect(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>('[data-gallery-id]');
    const open = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.currentTarget as HTMLAnchorElement;
      const next = items.findIndex(item => item.id === link.dataset.galleryId);
      if (next < 0) return;
      event.preventDefault(); previousTrigger.current = link; setIndex(next);
    };
    links.forEach(link => { link.addEventListener('click', open); link.setAttribute('aria-haspopup', 'dialog'); });
    return () => links.forEach(link => { link.removeEventListener('click', open); link.removeAttribute('aria-haspopup'); });
  }, [items]);
  const selected = index === null ? null : items[index];
  return <Dialog.Root open={index !== null} onOpenChange={open => { if (!open) { setIndex(null); requestAnimationFrame(() => previousTrigger.current?.focus()); } }}>
    <Dialog.Portal><Dialog.Backdrop className="lightbox-backdrop"/>
      <Dialog.Popup className="lightbox-popup" onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } }}>
        <Dialog.Title className="sr-only">{selected?.label || 'WANA concept gallery'}</Dialog.Title>
        <Dialog.Description className="sr-only">AI-generated concept imagery. Use the arrow keys or swipe to explore the gallery. Escape closes the image.</Dialog.Description>
        <Dialog.Close render={<Button variant="ghost" size="icon-lg" className="lightbox-close" aria-label="Close image" />}><span aria-hidden="true">×</span></Dialog.Close>
        {selected && <figure onPointerDown={event => { start.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerCancel={() => { start.current = null; }} onPointerUp={event => { if (start.current) { const dx = event.clientX - start.current.x; const dy = event.clientY - start.current.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) move(dx < 0 ? 1 : -1); } start.current = null; }}>
          <img src={selected.src} width={selected.width} height={selected.height} alt={selected.alt} draggable={false}/>
          <figcaption><span>{selected.label}</span><span>{(index ?? 0) + 1} / {count}</span></figcaption>
        </figure>}
        <div className="lightbox-navigation"><Button variant="ghost" size="icon-lg" aria-label="Previous image" onClick={() => move(-1)}>←</Button><span>Concept imagery</span><Button variant="ghost" size="icon-lg" aria-label="Next image" onClick={() => move(1)}>→</Button></div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
