import { config } from "dotenv";
const testPort=Number(process.env.CODEYEA_TEST_PORT || 3001);
export function assertTestEnvironment() {
  const url = new URL(
    process.env.DATABASE_URL || "postgresql://invalid/invalid",
  );
  const directUrl = new URL(
    process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://invalid/invalid",
  );
  if (
    process.env.CODEYEA_ENV !== "test" ||
    [url, directUrl].some(
      (target) =>
        target.hostname !== "127.0.0.1" ||
        target.pathname !== "/codeyea_test" ||
        target.username !== "codeyea_test",
    ) ||
    !Number.isInteger(testPort) || testPort < 3001 || testPort > 3999 ||
    process.env.BETTER_AUTH_URL !== `http://127.0.0.1:${testPort}`
  ) {
    throw new Error(
      "Tests require the isolated codeyea_test role/database and a dedicated loopback test port. Run npm run test:setup.",
    );
  }
}
export function loadTestEnvironment() {
  const result = config({ path: ".env.test", override: true, quiet: true });
  if (result.error)
    throw new Error("Missing .env.test. Run npm run test:setup.");
  if(process.env.CODEYEA_TEST_PORT) process.env.BETTER_AUTH_URL=`http://127.0.0.1:${testPort}`;
  assertTestEnvironment();
}
