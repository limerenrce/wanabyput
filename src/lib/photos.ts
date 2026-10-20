import type { ImageMetadata } from 'astro';
import heroLandscape from '@/assets/photos/hero-landscape.png';
import heroPortrait from '@/assets/photos/hero-portrait.png';
import welcome from '@/assets/photos/welcome.png';
import shoulder from '@/assets/photos/shoulder.png';
import foot from '@/assets/photos/foot.png';
import couple from '@/assets/photos/couple.png';
import facial from '@/assets/photos/facial.png';
import body from '@/assets/photos/body.png';
import treatmentRoom from '@/assets/photos/treatment-room.png';
import corridor from '@/assets/photos/corridor.png';
import reception from '@/assets/photos/reception.png';
import details from '@/assets/photos/details.png';

export interface PhotoAsset { src: ImageMetadata; alt: string; label: string; position: string }
export const photos = {
  'hero-landscape': { src: heroLandscape, alt: 'A therapist gently tending an adult guest in an intimate, olive-toned spa room.', label: 'A moment, just for you', position: '73% 46%' },
  'hero-portrait': { src: heroPortrait, alt: 'A therapist and an adult guest sharing a quiet treatment moment.', label: 'The human touch', position: '59% 57%' },
  welcome: { src: welcome, alt: 'An adult therapist offering a warm welcome at a timber doorway.', label: 'A gentle welcome', position: '52% 48%' },
  shoulder: { src: shoulder, alt: 'A therapist’s hands resting gently on an adult guest’s shoulders above ivory spa linen.', label: 'The art of touch', position: '53% 39%' },
  foot: { src: foot, alt: 'An adult guest receiving a gentle foot ritual from a therapist.', label: 'Room to pause', position: '54% 47%' },
  couple: { src: couple, alt: 'Two adults in opaque spa robes taking a quiet moment together in a lounge.', label: 'A shared stillness', position: '53% 48%' },
  facial: { src: facial, alt: 'A therapist attending to an adult guest’s face as they rest beneath ivory linen.', label: 'Softness in the details', position: '52% 55%' },
  body: { src: body, alt: 'A therapist caring for an adult guest’s arm beside carefully arranged spa linen.', label: 'Care, considered', position: '57% 58%' },
  'treatment-room': { src: treatmentRoom, alt: 'A softly lit concept treatment room with olive plaster, warm timber, and an ivory linen bed.', label: 'An intimate sanctuary', position: '58% 65%' },
  corridor: { src: corridor, alt: 'Filtered light falling across an olive-toned spa passage and tropical plants.', label: 'Leave the rush behind', position: '62% 56%' },
  reception: { src: reception, alt: 'An adult therapist greeting a fully clothed adult guest in a warm, timber-lined lounge.', label: 'An invitation to slow down', position: '64% 48%' },
  details: { src: details, alt: 'Adult hands folding ivory linen beside a frangipani flower and terracotta vessel.', label: 'Small, meaningful rituals', position: '52% 58%' },
} satisfies Record<string, PhotoAsset>;
export type PhotoKey = keyof typeof photos;
export const galleryPhotos: PhotoKey[] = ['welcome', 'treatment-room', 'shoulder', 'corridor', 'facial', 'couple', 'foot', 'body', 'reception', 'details'];
