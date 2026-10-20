import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function mountMotion() {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.hero-content > *', { y: 18, opacity: 0, duration: .75, stagger: .08, ease: 'power2.out', clearProps: 'transform,opacity' });
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => {
      gsap.from(element, { y: 28, opacity: 0, duration: .8, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
    });
  });
  media.add('(min-width: 1000px) and (prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll<HTMLElement>('[data-photo-story]').forEach(element => {
      const pictures = element.querySelectorAll('.space-image img');
      gsap.fromTo(pictures, { clipPath: 'inset(8% 0 8% 0)' }, { clipPath: 'inset(0% 0 0% 0)', ease: 'none', stagger: .06, scrollTrigger: { trigger: element, start: 'top 12%', end: '+=32%', scrub: .5, pin: true, anticipatePin: 1 } });
    });
  });
  return () => media.revert();
}
