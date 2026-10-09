import {defaultHomepage} from "../content/homepage-defaults";
import { snapshotSchema } from "../schemas/content";
/** Compare normalized content, never the page's legacy PUBLISHED flag. */
export function hasUnpublishedChanges(draft: unknown, published: unknown) {
  const saved = snapshotSchema.safeParse(draft);
  const live = snapshotSchema.safeParse(published);
  return (
    !saved.success ||
    !live.success ||
    JSON.stringify({...saved.data,homepage:saved.data.homepage??defaultHomepage()}) !== JSON.stringify({...live.data,homepage:live.data.homepage??defaultHomepage()})
  );
}
