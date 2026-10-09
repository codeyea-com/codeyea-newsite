import { z } from "zod";
import { stableId, heading } from "./contract-primitives";
import { homepageSnapshotV1 } from "./homepage-contracts";
import { postContract, collectionContract } from "./collection-contracts";
export const localeDefinition = z
  .object({
    id: stableId,
    code: z.string().min(2).max(35),
    name: heading,
    direction: z.enum(["ltr", "rtl"]),
    enabled: z.boolean(),
    position: z.number().int().nonnegative(),
  })
  .strict();
export const marketDefinition = z
  .object({
    id: stableId,
    name: heading,
    currency: z.string().regex(/^[A-Z]{3}$/),
    defaultLocaleId: stableId,
    localeIds: z.array(stableId).min(1).max(30),
    enabled: z.boolean(),
    position: z.number().int().nonnegative(),
  })
  .strict()
  .refine(
    (v) => v.localeIds.includes(v.defaultLocaleId),
    "Default locale must be supported",
  );
const revision = {
  id: stableId,
  entityId: stableId,
  actorId: stableId,
  version: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  reason: z.string().trim().min(1).max(500),
  schemaVersion: z.literal(1),
};
export const pageRevisionEnvelope = z
  .object({
    ...revision,
    kind: z.literal("pageRevision"),
    snapshot: homepageSnapshotV1,
  })
  .strict()
  .refine((v) => v.entityId === v.snapshot.id, "Revision entity mismatch");
export const postRevisionEnvelope = z
  .object({
    ...revision,
    kind: z.literal("postRevision"),
    snapshot: z
      .object({
        schemaVersion: z.literal(1),
        post: postContract,
        records: z.array(collectionContract).max(500),
      })
      .strict(),
  })
  .strict()
  .refine((v) => v.entityId === v.snapshot.post.id, "Revision entity mismatch");
export type PageRevisionEnvelope = z.infer<typeof pageRevisionEnvelope>;
export type PostRevisionEnvelope = z.infer<typeof postRevisionEnvelope>;
