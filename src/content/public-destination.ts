/** Keep calls to contact on the live site attached to the working inquiry form. */
export function publicDestination(value: string) {
  const path = value.trim();
  if (
    path === "#contact" ||
    path === "/#contact" ||
    /^https?:\/\/(?:www\.)?codeyea\.com\/contact\/?(?:#.*)?$/i.test(path) ||
    /^\/contact\/?(?:#.*)?$/i.test(path)
  ) {
    return "/contact/#contact-form";
  }
  return path;
}
