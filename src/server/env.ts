import { z } from "zod";
const schema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((v) => /^postgres(ql)?:/.test(v), "PostgreSQL URL required"),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z
    .string()
    .url()
    .refine((v) => {
      const u = new URL(v);
      return (
        u.protocol === "https:" ||
        (u.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(u.hostname))
      );
    }, "HTTPS required except on loopback"),
});
export function getEnv() {
  if (process.env.CODEYEA_ENV === "test") {
    const testPort=Number(process.env.CODEYEA_TEST_PORT || 3001);
    const url = new URL(
      process.env.DATABASE_URL || "postgresql://invalid/invalid",
    );
    if (
      url.hostname !== "127.0.0.1" ||
      url.pathname !== "/codeyea_test" ||
      url.username !== "codeyea_test" ||
      !Number.isInteger(testPort) || testPort < 3001 || testPort > 3999 ||
      process.env.BETTER_AUTH_URL !== `http://127.0.0.1:${testPort}`
    )
      throw new Error("Test server refuses a non-test database or origin.");
  }
  const parsed = schema.safeParse(process.env);
  if (!parsed.success)
    throw new Error(
      "Missing or invalid server environment: " +
        parsed.error.issues.map((i) => i.path.join(".")).join(", "),
    );
  return parsed.data;
}
