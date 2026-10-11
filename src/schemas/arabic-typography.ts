import { z } from "zod";
const weight = z.union([
  z.literal(200),
  z.literal(300),
  z.literal(400),
  z.literal(500),
  z.literal(600),
  z.literal(700),
]);
export const defaultArabicTypography = {
  h1: 600,
  h2: 500,
  h3: 500,
  body: 400,
  navigation: 400,
  buttons: 500,
} as const;
export const arabicTypographySchema = z.object({
  h1: weight,
  h2: weight,
  h3: weight,
  body: weight,
  navigation: weight,
  buttons: weight,
});
export type ArabicTypography = z.infer<typeof arabicTypographySchema>;
export function arabicTypographyCss(value: ArabicTypography) {
  const pageText = ":not(:where(.internal-hero-media *, .internal-hero-brand))";
  const root = 'html[lang="ar"] .hp.public-surface';
  return `${root}{--ar-h1:${value.h1};--ar-h2:${value.h2};--ar-h3:${value.h3};--ar-body:${value.body};--ar-navigation:${value.navigation};--ar-buttons:${value.buttons};}
 ${root} h1${pageText}{font-weight:var(--ar-h1)!important}
 ${root} :is(h2,.about-project-ghost-title)${pageText}{font-weight:var(--ar-h2)!important}
 ${root} :is(h3,#services h3)${pageText}{font-weight:var(--ar-h3)!important}
 ${root} :is(p,li,input,textarea,select,.hp-positioning-body)${pageText}{font-weight:var(--ar-body)!important}
 ${root} .hp-header :is(a,button,.cy-host-line strong){font-weight:var(--ar-navigation)!important}
 ${root} :is(button,.hp-button,.about-reference-button,.rf-corporate-button,.b-btn,.hp-flow-cta)${pageText}{font-weight:var(--ar-buttons)!important}
 ${root} .hp-header .hp-header-quote{font-weight:var(--ar-buttons)!important}`;
}
