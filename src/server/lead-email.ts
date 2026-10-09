import { recipients } from "@/schemas/lead";
import { createLeadPdf } from "./lead-pdf";

type LeadEmailData = {
  id: string;
  kind: "contact" | "quote";
  name: string;
  email: string;
  createdAt: Date;
  payload: unknown;
};

function readableLead(lead: LeadEmailData) {
  const payload =
    lead.payload && typeof lead.payload === "object" && !Array.isArray(lead.payload)
      ? (lead.payload as Record<string, unknown>)
      : {};
  const rows: Array<[string, unknown]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Company", payload.company],
    ["Phone", payload.phone],
    ["Services", payload.services],
    ["Subject", payload.subject],
    ["Message", payload.message],
  ];
  const answers =
    payload.answers && typeof payload.answers === "object" && !Array.isArray(payload.answers)
      ? (payload.answers as Record<string, unknown>)
      : {};
  rows.push(
    ...Object.entries(answers).map(([key, value]): [string, unknown] => [key, value]),
  );
  return [
    `New CODEYEA ${lead.kind === "quote" ? "quote request" : "contact enquiry"}`,
    "",
    ...rows
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([label, value]) => `${label}: ${Array.isArray(value) ? value.join(", ") : String(value)}`),
    "",
    "CODEYEA | https://codeyea.com | info@codeyea.com",
  ].join("\n");
}

export async function buildLeadEmailPayload(lead: LeadEmailData, from: string) {
  const body: Record<string, unknown> = {
    from,
    to: recipients[lead.kind],
    reply_to: lead.email,
    subject: `CODEYEA ${lead.kind === "quote" ? "quote request" : "contact enquiry"} — ${lead.name.replace(/[\r\n]/g, " ")}`,
    text: readableLead(lead),
  };
  if (lead.kind === "quote") {
    const pdf = await createLeadPdf(lead);
    body.attachments = [
      {
        filename: `CODEYEA-quote-${lead.id.slice(0, 8)}.pdf`,
        content_type: "application/pdf",
        content: Buffer.from(pdf).toString("base64"),
      },
    ];
  }
  return body;
}
