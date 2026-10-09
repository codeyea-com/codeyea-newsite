import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

type LeadPdfData = {
  kind: "contact" | "quote";
  name: string;
  email: string;
  createdAt: Date;
  payload: unknown;
};

const pageWidth = 612;
const pageHeight = 792;
const margin = 48;
const ink = rgb(0.09, 0.16, 0.25);
const muted = rgb(0.38, 0.43, 0.49);
const accent = rgb(0.91, 0.29, 0.30);
const line = rgb(0.85, 0.87, 0.89);

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function valueText(value: unknown): string {
  if (Array.isArray(value)) return value.map(valueText).filter(Boolean).join(", ");
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
}

function labelText(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function wrapText(text: string, font: PDFFont, size: number, width: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function createLeadPdf(lead: LeadPdfData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`CODEYEA ${lead.kind === "quote" ? "Quote Request" : "Contact Enquiry"}`);
  pdf.setAuthor("CODEYEA");
  pdf.setSubject("Website enquiry details");

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = await readFile(path.join(process.cwd(), "public", "brand", "logo-dark.png"));
  const logo = await pdf.embedPng(logoBytes);
  const logoSize = logo.scale(Math.min(148 / logo.width, 34 / logo.height));
  const form = pdf.getForm();
  let page = pdf.addPage([pageWidth, pageHeight]);
  let cursor = pageHeight - margin;

  const drawBrand = (firstPage: boolean) => {
    page.drawImage(logo, {
      x: margin,
      y: cursor - logoSize.height,
      width: logoSize.width,
      height: logoSize.height,
    });
    page.drawText("codeyea.com", {
      x: pageWidth - margin - regular.widthOfTextAtSize("codeyea.com", 9),
      y: cursor - 11,
      size: 9,
      font: regular,
      color: muted,
    });
    page.drawText("info@codeyea.com", {
      x: pageWidth - margin - regular.widthOfTextAtSize("info@codeyea.com", 9),
      y: cursor - 25,
      size: 9,
      font: regular,
      color: muted,
    });
    cursor -= firstPage ? 56 : 44;
    page.drawLine({ start: { x: margin, y: cursor }, end: { x: pageWidth - margin, y: cursor }, thickness: 2, color: accent });
    cursor -= 27;
  };

  const nextPage = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    cursor = pageHeight - margin;
    drawBrand(false);
  };

  const ensureSpace = (height: number) => {
    if (cursor - height < margin + 24) nextPage();
  };

  drawBrand(true);
  const heading = lead.kind === "quote" ? "QUOTE REQUEST" : "CONTACT ENQUIRY";
  page.drawText(heading, { x: margin, y: cursor, size: 20, font: bold, color: ink });
  const submitted = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(lead.createdAt);
  const submittedLabel = `Submitted ${submitted} UTC`;
  page.drawText(submittedLabel, {
    x: pageWidth - margin - regular.widthOfTextAtSize(submittedLabel, 9),
    y: cursor + 5,
    size: 9,
    font: regular,
    color: muted,
  });
  cursor -= 34;

  const details = record(lead.payload);
  const entries: Array<[string, string]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Company", valueText(details.company)],
    ["Phone", valueText(details.phone)],
    ["Requested services", valueText(details.services)],
    ["Subject", valueText(details.subject)],
    ["Message", valueText(details.message)],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const answers = record(details.answers);
  for (const [key, value] of Object.entries(answers)) {
    const rendered = valueText(value);
    if (rendered) entries.push([labelText(key), rendered]);
  }

  for (const [label, value] of entries) {
    const lines = wrapText(value, regular, 10, pageWidth - margin * 2);
    const blockHeight = 18 + lines.length * 14 + 8;
    ensureSpace(Math.min(blockHeight, pageHeight - margin * 2));
    page.drawText(label.toUpperCase(), { x: margin, y: cursor, size: 8, font: bold, color: muted });
    cursor -= 15;
    for (const textLine of lines) {
      ensureSpace(15);
      page.drawText(textLine, { x: margin, y: cursor, size: 10, font: regular, color: ink, maxWidth: pageWidth - margin * 2 });
      cursor -= 14;
    }
    cursor -= 8;
    page.drawLine({ start: { x: margin, y: cursor + 3 }, end: { x: pageWidth - margin, y: cursor + 3 }, thickness: 0.6, color: line });
  }

  ensureSpace(138);
  page.drawText("ADDITIONAL INFORMATION / NOTES", {
    x: margin,
    y: cursor,
    size: 8,
    font: bold,
    color: muted,
  });
  cursor -= 12;
  const notes = form.createTextField("additional_notes");
  notes.enableMultiline();
  notes.addToPage(page, {
    x: margin,
    y: cursor - 96,
    width: pageWidth - margin * 2,
    height: 96,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: rgb(1, 1, 1),
    textColor: ink,
  });
  notes.setFontSize(10);
  page.drawText("This field is editable. Add follow-up details before saving or forwarding.", {
    x: margin,
    y: cursor - 112,
    size: 8,
    font: regular,
    color: muted,
  });
  form.updateFieldAppearances(regular);
  return pdf.save();
}
