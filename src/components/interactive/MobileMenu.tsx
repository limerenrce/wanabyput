import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Button } from '@/components/ui/button';
import { NAV_LINKS } from '@/consts';
export default function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger render={<Button variant="ghost" size="lg" className="mobile-menu-trigger" />}>
      <span>Menu</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M3 8h18M3 16h18"/></svg>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Backdrop className="menu-backdrop"/>
      <Dialog.Popup className="menu-popup">
        <div className="menu-top"><a href="/" className="wordmark">wana</a><Dialog.Close render={<Button variant="ghost" size="icon-lg" aria-label="Close navigation" />}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></Dialog.Close></div>
        <Dialog.Title className="sr-only">Explore WANA</Dialog.Title>
        <nav aria-label="Mobile navigation"><a href="/" onClick={() => setOpen(false)} aria-current={pathname === '/' ? 'page' : undefined}>Home</a>{NAV_LINKS.map((link, i) => <a key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={pathname.startsWith(link.href) ? 'page' : undefined}><span className="menu-index">0{i + 1}</span>{link.label}</a>)}</nav>
        <p className="menu-location">Coming soon<br/>Near Crystal Bay, Nusa Penida</p>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
