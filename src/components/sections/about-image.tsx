import type { CSSProperties } from "react";
import type { AboutMedia } from "@/schemas/about";
import { mediaProps } from "@/content/homepage-render";
import {generatedArtwork} from '@/content/generated-artwork';
import {generalArtwork} from '@/content/generated-general-artwork';
export function AboutImage({
  media,
  priority = false,
  className = "",
  sizes = "(max-width: 1199px) 100vw, 60vw",
  artworkKey,
  locale = 'en',
}: {
  media?: AboutMedia;
  priority?: boolean;
  className?: string;
  sizes?: string;
  artworkKey?: string;
  locale?: string;
}) {
  if (!media) return null;
  const props = mediaProps(media);
  const art=generatedArtwork(media.mediaId);
  const general=generalArtwork(artworkKey,media);
  const image = (
    <img
      {...props}
      {...(general ? {src:general.src,srcSet:undefined,alt:general.alt[locale==='ar'?'ar':'en']} : {})}
      className={"about-image " + className}
      width={media.width ?? 1200}
      height={media.height ?? 800}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      style={
        {
          ...props.style,
          ...(general ? {objectPosition:'50% 50%'} : {}),
          "--focal-desktop": general ? '50% 50%' : `${media.focalX}% ${media.focalY}%`,
          "--focal-tablet": general ? '50% 50%' : `${media.tabletFocalX ?? media.focalX}% ${media.tabletFocalY ?? media.focalY}%`,
          "--focal-mobile": general ? '50% 50%' : `${media.mobileFocalX ?? media.focalX}% ${media.mobileFocalY ?? media.focalY}%`,
        } as CSSProperties
      }
    />
  );
  if (general?.mobileSrc || general?.tabletSrc) {
    return (
      <picture style={{ display: "contents" }}>
        {general.mobileSrc && <source media="(max-width:767px)" srcSet={general.mobileSrc} />}
        {general.tabletSrc && <source media="(max-width:1199px)" srcSet={general.tabletSrc} />}
        {image}
      </picture>
    );
  }
  if (!general && art?.mobileSrc) {
    return <picture style={{ display: "contents" }}><source media="(max-width:767px)" srcSet={art.mobileSrc} />{image}</picture>;
  }
  return image;
}
