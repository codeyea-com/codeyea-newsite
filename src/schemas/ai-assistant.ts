import { z } from "zod";

export const aiProposalRequestSchema = z.object({
  pageId: z.string().min(1).max(120),
  expectedVersion: z.number().int().positive(),
  instruction: z.string().trim().min(10).max(1200),
  snapshot: z.record(z.string(), z.unknown()),
}).strict();

export const aiTextPatchSchema = z.object({
  summary: z.string().trim().min(1).max(500),
  changes: z.array(z.object({
    path: z.string().min(1).max(240).regex(/^[a-zA-Z][a-zA-Z0-9]*(?:\.(?:[a-zA-Z][a-zA-Z0-9]*|\d+))*$/),
    value: z.string().max(5000),
  }).strict()).min(1).max(20),
}).strict().superRefine((proposal, ctx) => {
  const paths = new Set<string>();
  proposal.changes.forEach((change, index) => {
    if (paths.has(change.path)) ctx.addIssue({ code: "custom", path: ["changes", index, "path"], message: "A field can appear only once." });
    paths.add(change.path);
  });
});

export type AiTextPatch = z.infer<typeof aiTextPatchSchema>;
