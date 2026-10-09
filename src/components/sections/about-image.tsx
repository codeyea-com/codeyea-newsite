import type { CSSProperties } from "react";
import type { AboutMedia } from "@/schemas/about";
import { mediaProps } from "@/content/homepage-render";
export function AboutImage({
  media,
  priority = false,
  className = "",
  sizes = "(max-width: 1199px) 100vw, 60vw",
}: {
  media?: AboutMedia;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  if (!media) return null;
  const props = mediaProps(media);
  return (
    <img
      {...props}
      className={"about-image " + className}
      width={media.width ?? 1200}
      height={media.height ?? 800}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      style={
        {
          ...props.style,
          "--focal-desktop": `${media.focalX}% ${media.focalY}%`,
          "--focal-tablet": `${media.tabletFocalX ?? media.focalX}% ${media.tabletFocalY ?? media.focalY}%`,
          "--focal-mobile": `${media.mobileFocalX ?? media.focalX}% ${media.mobileFocalY ?? media.focalY}%`,
        } as CSSProperties
      }
    />
  );
}
