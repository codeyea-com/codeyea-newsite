import type { EditorObject } from "../schemas/homepage-editor";

/** Explain the saved annual price without applying the discount a second time. */
export function annualPlanSavings(plan: EditorObject) {
  const price = (value: unknown) => {
    const text = String(value ?? "");
    return /^\$?\d+(\.\d{1,2})?$/.test(text)
      ? Math.round(Number(text.replace("$", "")) * 100)
      : NaN;
  };
  const monthly = price(plan.monthlyPrice);
  const annual = price(plan.annualPrice);
  const regularAnnual = monthly * 12;
  if (!(regularAnnual > 0 && annual >= 0 && annual < regularAnnual)) return null;
  const percent = Math.round((1 - annual / regularAnnual) * 100);
  if (percent < 1) return null;
  return { percent, regularAnnual: `$${Number((regularAnnual / 100).toFixed(2))}` };
}
