import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import { db } from "../src/server/db";
import { getEnv } from "../src/server/env";
const generated = process.argv.includes("--generate-local");
let email: string, password: string;
if (generated) {
  if (
    !["localhost", "127.0.0.1"].includes(
      new URL(getEnv().BETTER_AUTH_URL).hostname,
    )
  )
    throw new Error("Generated access is restricted to local development.");
  if (existsSync(".local/owner-access.txt"))
    throw new Error("Local access file already exists; refusing to overwrite.");
  email = "owner@codeyea.local";
  password = randomBytes(24).toString("base64url");
} else {
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  email = await prompt.question("Administrator email: ");
  prompt.close();
  process.stdout.write("New password (12–128 characters, hidden): ");
  const silent = new Writable({
    write(_chunk, _encoding, done) {
      done();
    },
  });
  const secretPrompt = createInterface({
    input: process.stdin,
    output: silent,
    terminal: true,
  });
  password = await secretPrompt.question("");
  secretPrompt.close();
  process.stdout.write("\n");
}
email = z.email().parse(email.trim().toLowerCase());
password = z.string().min(12).max(128).parse(password);
if (await db.user.findUnique({ where: { email } }))
  throw new Error(
    "User exists; this command never changes existing passwords or grants.",
  );
const id = randomUUID(),
  hash = await hashPassword(password);
await db.$transaction(async (tx) => {
  await tx.user.create({
    data: {
      id,
      name: "CODEYEA Owner",
      email,
      emailVerified: true,
      accounts: {
        create: {
          id: randomUUID(),
          accountId: id,
          providerId: "credential",
          password: hash,
        },
      },
      roles: { create: { roleId: "administrator" } },
    },
  });
  await tx.auditLog.create({
    data: {
      actorKind: "OPERATOR",
      actorLabel: "Local administrator bootstrap",
      entityType: "User",
      entityId: id,
      action: "user.bootstrapped",
      after: { role: "administrator" },
    },
  });
});
if (generated) {
  mkdirSync(".local", { recursive: true });
  writeFileSync(
    ".local/owner-access.txt",
    `LOCAL DEVELOPMENT ACCESS ONLY\nURL: ${getEnv().BETTER_AUTH_URL}/login\nEmail: ${email}\nPassword: ${password}\n\nGenerated for this prototype; never reuse as a production password.\n`,
    { mode: 0o600 },
  );
  console.log(
    "Local administrator created. Credentials are in ignored .local/owner-access.txt; not printed.",
  );
} else console.log("Administrator created.");
await db.$disconnect();
