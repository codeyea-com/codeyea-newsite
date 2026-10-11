import { readIntegrationSettings } from "@/server/integration-settings";
import { arabicTypographyCss } from "@/schemas/arabic-typography";
export async function GET() {
  const settings = await readIntegrationSettings();
  return new Response(arabicTypographyCss(settings.value.arabicTypography), {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
