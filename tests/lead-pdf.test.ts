import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { buildLeadEmailPayload } from "../src/server/lead-email";
import { createLeadPdf } from "../src/server/lead-pdf";

test("quote request PDF includes editable additional notes and brand contact", async () => {
  const pdf = await createLeadPdf({
    kind: "quote",
    name: "Morgan Example",
    email: "morgan@example.com",
    createdAt: new Date("2026-10-07T12:00:00.000Z"),
    payload: {
      company: "Example Studio",
      phone: "+1 555 0100",
      services: ["Website design"],
      message: "Please send a quote.",
    },
  });

  assert.equal(Buffer.from(pdf).subarray(0, 5).toString(), "%PDF-");
  const document = await PDFDocument.load(pdf);
  assert.equal(document.getPages().length, 1);

  const notes = document.getForm().getTextField("additional_notes");
  assert.equal(notes.getText() ?? "", "");
  assert.ok(notes.isMultiline());
});

test("quote email carries a readable summary and editable branded PDF attachment", async () => {
  const message = await buildLeadEmailPayload(
    {
      id: "12345678-1234-1234-1234-123456789abc",
      kind: "quote",
      name: "Morgan Example",
      email: "morgan@example.com",
      createdAt: new Date("2026-10-07T12:00:00.000Z"),
      payload: {
        company: "Example Studio",
        services: ["Website design"],
        consent: true,
        websiteTrap: "",
      },
    },
    "CODEYEA <info@codeyea.com>",
  );

  assert.equal(message.reply_to, "morgan@example.com");
  assert.match(String(message.text), /Services: Website design/);
  assert.doesNotMatch(String(message.text), /websiteTrap|submissionId|consent/);
  const attachments = message.attachments as Array<{
    filename: string;
    content: string;
    content_type: string;
  }>;
  assert.equal(attachments.length, 1);
  assert.equal(attachments[0].filename, "CODEYEA-quote-12345678.pdf");
  assert.equal(attachments[0].content_type, "application/pdf");
  const pdf = await PDFDocument.load(Buffer.from(attachments[0].content, "base64"));
  assert.equal(pdf.getAuthor(), "CODEYEA");
  assert.ok(pdf.getForm().getTextField("additional_notes").isMultiline());
});

test("contact enquiry remains a concise email without a quote-request PDF", async () => {
  const message = await buildLeadEmailPayload(
    {
      id: "87654321-1234-1234-1234-123456789abc",
      kind: "contact",
      name: "Morgan Example",
      email: "morgan@example.com",
      createdAt: new Date("2026-10-07T12:00:00.000Z"),
      payload: { message: "Please contact me." },
    },
    "CODEYEA <info@codeyea.com>",
  );

  assert.match(String(message.text), /Please contact me\./);
  assert.equal("attachments" in message, false);
});
