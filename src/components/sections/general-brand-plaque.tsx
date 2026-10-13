import type {AboutMedia} from '@/schemas/about';
import {generalArtwork} from '@/content/generated-general-artwork';
import '@/styles/general-artwork.css';

/** The owner's foreground-logo idea, using the exact official asset. */
export function GeneralBrandPlaque({artworkKey,media}:{artworkKey?:string;media?:AboutMedia}) {
  return generalArtwork(artworkKey,media) ? <span className="general-brand-plaque"><img src="/brand/logo-dark.png" alt="CODEYEA" width="1204" height="274" /></span> : null;
}
