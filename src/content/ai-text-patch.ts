export type TextChange = { path: string; value: string };
const editableKeys = new Set(["title", "heading", "body", "description", "focusPhrase", "socialTitle", "socialDescription", "label", "eyebrow", "actionLabel", "supportHeading", "subtitle", "suffix", "copyright", "kicker", "value"]);

/** Apply only existing string leaves; paths cannot add fields or alter structure. */
export function applyAiTextChanges<T extends Record<string, unknown>>(source: T, changes: TextChange[]): T {
  const result = structuredClone(source);
  for (const change of changes) {
    if (!/^[a-zA-Z][a-zA-Z0-9]*(?:\.(?:[a-zA-Z][a-zA-Z0-9]*|\d+))*$/.test(change.path)) throw new Error("Invalid text field path.");
    const parts = change.path.split(".");
    let target: unknown = result;
    for (const part of parts.slice(0, -1)) {
      if (!target || typeof target !== "object" || !Object.hasOwn(target, part)) throw new Error("Text field no longer exists.");
      target = (target as Record<string, unknown>)[part];
    }
    const leaf = parts.at(-1)!;
    if (!editableKeys.has(leaf)) throw new Error("This field is protected.");
    if (!target || typeof target !== "object" || !Object.hasOwn(target, leaf) || typeof (target as Record<string, unknown>)[leaf] !== "string") throw new Error("Only existing text can be edited.");
    (target as Record<string, unknown>)[leaf] = change.value;
  }
  return result;
}
