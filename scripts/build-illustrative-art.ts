import fs from "node:fs/promises";
import path from "node:path";
import { illustrativeWork } from "../src/content/illustrative-work";
const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const labels: Record<string, [string, string, string, string, string, string]> =
  {
    "seo-geo": [
      "Search result",
      "نتيجة البحث",
      "Useful page",
      "صفحة مفيدة",
      "Source context",
      "سياق المصدر",
    ],
    "digital-marketing": [
      "Campaign",
      "الحملة",
      "Customer action",
      "تفاعل العميل",
      "Follow-up",
      "المتابعة",
    ],
    "web-mobile-apps": [
      "Application",
      "التطبيق",
      "Current status",
      "الحالة الحالية",
      "Next action",
      "الخطوة التالية",
    ],
    "ai-automation": [
      "Workflow",
      "الإجراءات",
      "Approved source",
      "المصدر المعتمد",
      "Human review",
      "مراجعة بشرية",
    ],
  };
function lines(s: string, n = 24) {
  const out: string[] = [];
  for (const word of s.split(" ")) {
    const last = out.length - 1;
    if (last < 0 || out[last].length + word.length > n) out.push(word);
    else out[last] += " " + word;
  }
  return out.slice(0, 3);
}
function text(
  x: number,
  y: number,
  s: string,
  size = 12,
  color = "#26354b",
  anchor = "start",
) {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
}
function panel(x: number, y: number, w: number, h: number, body: string) {
  return `<g filter="url(#shadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" fill-opacity=".96"/></g>${body}`;
}
for (const [slug, cards] of Object.entries(illustrativeWork)) {
  const root = path.join("public/site/generated", slug);
  await fs.mkdir(root, { recursive: true });
  for (const [index, c] of cards.entries()) {
    if (c.visual !== "technical") continue;
    for (const locale of ["en", "ar"] as const) {
      const ar = locale === "ar",
        accent =
          slug === "seo-geo"
            ? "#138b67"
            : slug === "digital-marketing"
              ? "#db613c"
              : slug === "web-mobile-apps"
                ? "#287ed2"
                : "#8453b8";
      const base = panel(
        25,
        35,
        310,
        220,
        `<rect x="25" y="35" width="310" height="25" fill="${accent}"/>${text(42, 52, c.topic, 10, "#fff")}`,
      );
      let body = "";
      if (slug === "seo-geo" && index === 0) {
        body =
          `<rect x="45" y="78" width="145" height="90" fill="#e5f1ec"/>` +
          text(
            58,
            105,
            ar ? "خدمات متخصصة" : "Specialist services",
            14,
            accent,
          ) +
          text(58, 127, ar ? "معلومات واضحة" : "Clear information", 11) +
          `<rect x="58" y="140" width="112" height="22" fill="${accent}"/>` +
          text(68, 155, ar ? "طلب التفاصيل" : "Request details", 9, "#fff");
        body +=
          '<path d="M45 197h120m-120 12h90m-90 12h108" stroke="#c2d6cb" stroke-width="5"/>';
      } else if (slug === "seo-geo" && index === 2) {
        body += text(
          180,
          90,
          ar ? "صفحات الفئات" : "Category pages",
          15,
          accent,
          "middle",
        );
        body +=
          '<path d="M180 107v27M70 134h220M70 134v20M180 134v20M290 134v20" fill="none" stroke="#78b6a0" stroke-width="2"/>';
        for (let i = 0; i < 3; i++)
          body +=
            `<rect x="${47 + i * 90}" y="154" width="77" height="69" fill="#e9f5ef"/>` +
            text(57 + i * 90, 177, ar ? "فئة منتجات" : "Category", 9) +
            `<path d="M${57 + i * 90} 194h49m-49 10h34" stroke="#95bfaf" stroke-width="3"/>`;
      } else if (slug === "web-mobile-apps" && index === 0) {
        body += text(
          45,
          87,
          ar ? "اختَر الموعد المناسب" : "Choose an appointment",
          14,
          accent,
        );
        for (let i = 0; i < 21; i++)
          body +=
            `<rect x="${45 + (i % 7) * 36}" y="${105 + Math.floor(i / 7) * 32}" width="29" height="25" fill="${[8, 10, 16].includes(i) ? accent : "#edf1f7"}"/>` +
            text(
              53 + (i % 7) * 36,
              122 + Math.floor(i / 7) * 32,
              String(i + 1),
              9,
              [8, 10, 16].includes(i) ? "#fff" : "#536379",
            );
        body += text(
          45,
          222,
          ar ? "متاح للحجز" : "Available to book",
          11,
          accent,
        );
      } else if (
        (slug === "digital-marketing" && index === 2) ||
        (slug === "ai-automation" && index === 2)
      ) {
        const steps =
          slug === "ai-automation"
            ? ar
              ? ["استخراج", "تحقق", "موافقة"]
              : ["Extract", "Check", "Approve"]
            : ar
              ? ["تفاعل", "رسالة", "متابعة"]
              : ["Action", "Email", "Follow-up"];
        steps.forEach((step, i) => {
          body += panel(
            43 + i * 91,
            117,
            78,
            63,
            text(82 + i * 91, 153, step, 11, accent, "middle"),
          );
          if (i < 2) body += text(126 + i * 91, 152, "→", 17, accent);
        });
        body += text(
          45,
          211,
          ar ? "خطوات واضحة وقابلة للمراجعة" : "Clear, reviewable steps",
          11,
        );
      } else if (slug === "digital-marketing" && index === 4) {
        body += text(
          45,
          88,
          ar ? "قراءة أداء الحملة" : "Campaign performance",
          14,
          accent,
        );
        body +=
          '<path d="M47 196h245M47 108v88" stroke="#cfd7df" fill="none"/><path d="M50 186L90 168L125 173L162 135L205 140L245 115L284 108" stroke="#df6a47" stroke-width="4" fill="none"/><path d="M50 195L90 180L125 185L162 163L205 154L245 147L284 133" stroke="#6d67bb" stroke-width="3" fill="none"/>';
        body += text(
          45,
          223,
          ar
            ? "المصادر · التفاعل · الاستفسارات"
            : "Sources · Actions · Enquiries",
          10,
        );
      } else {
        const items =
          slug === "web-mobile-apps"
            ? index === 2
              ? ar
                ? ["طلباتك", "المستندات", "الخطوة التالية"]
                : ["Requests", "Documents", "Next step"]
              : ar
                ? ["المكافآت", "حساب العميل", "طريقة الاستخدام"]
                : ["Rewards", "Customer account", "Redemption"]
            : slug === "ai-automation"
              ? index === 0
                ? ar
                  ? ["السؤال", "إجابة من المعرفة", "مصدر واضح"]
                  : ["Question", "Grounded answer", "Clear source"]
                : ar
                  ? ["إجراءات معتمدة", "صلاحيات الفريق", "مراجعة المصدر"]
                  : ["Approved procedures", "Team permissions", "Source review"]
              : slug === "seo-geo"
                ? ar
                  ? ["إجابة محددة", "خبرة مناسبة", "مصدر موثوق"]
                  : ["Specific answer", "Relevant expertise", "Source context"]
                : ar
                  ? ["رسالة الحملة", "صفحة الهبوط", "طلب التفاصيل"]
                  : ["Campaign message", "Landing page", "Request details"];
        items.forEach((item, i) => {
          body +=
            `<rect x="45" y="${83 + i * 49}" width="263" height="37" fill="${i === 1 ? accent + "18" : "#f3f5f8"}"/>` +
            text(
              ar ? 295 : 57,
              107 + i * 49,
              item,
              12,
              accent,
              ar ? "end" : "start",
            );
        });
      }
      const label = labels[slug][ar ? 5 : 4];
      let pop = text(
        ar ? 358 : 180,
        214,
        label,
        11,
        accent,
        ar ? "end" : "start",
      );
      lines(c[locale][0], 22).forEach(
        (l, i) =>
          (pop += text(
            ar ? 358 : 180,
            233 + i * 15,
            l,
            11,
            "#26354b",
            ar ? "end" : "start",
          )),
      );
      let floating = panel(164, 192, 213, 101, pop);
      if (slug === "seo-geo" && index === 0) {
        const logo = ["G", "o", "o", "g", "l", "e"]
          .map((letter, i) =>
            text(
              208 + i * 14,
              106,
              letter,
              22,
              [
                "#4285f4",
                "#ea4335",
                "#fbbc05",
                "#4285f4",
                "#34a853",
                "#ea4335",
              ][i],
            ),
          )
          .join("");
        let result =
          logo +
          '<rect x="205" y="119" width="156" height="22" fill="#f2f5f7"/>' +
          text(214, 134, ar ? "خدمة تناسب احتياجك" : "Find a specialist", 9);
        result += text(205, 164, "example.business › services", 8, "#4c5e54");
        result += text(
          ar ? 362 : 205,
          184,
          ar ? "خدمة واضحة. خطوة مباشرة." : "Clear service. Next step.",
          11,
          "#1a0dab",
          ar ? "end" : "start",
        );
        result +=
          '<path d="M205 199h147m-147 10h119m-119 10h137" stroke="#c9d0d9" stroke-width="3"/>' +
          text(
            205,
            246,
            ar ? "نتيجة بحث توضيحية" : "Illustrative search result",
            9,
            accent,
          );
        floating = panel(192, 72, 190, 194, result);
      }
      const tag = panel(
        7,
        5,
        150,
        42,
        text(20, 30, ar ? "تصوّر تطبيقي" : "Application concept", 11, accent),
      );
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="310" viewBox="0 0 400 310"><defs><filter id="shadow" x="-40%" y="-50%" width="190%" height="210%"><feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#21384e" flood-opacity=".18"/></filter></defs><g font-family="Arial,sans-serif">${base}${body}${floating}${tag}</g></svg>`;
      const name = `project-${index + 1}-${locale}.svg`;
      await fs.writeFile(path.join(root, name), svg);
      const archive = path.join(
        "C:/Users/grdez/Documents/codex-projects/codeyea/Generated images",
        slug === "seo-geo" ? "SEO" : slug,
        "application-concepts",
      );
      await fs.mkdir(archive, { recursive: true });
      await fs.writeFile(path.join(archive, name), svg);
      // A separately composed portrait interface for the native two-column phone cards.
      const mobileRows: Record<string, Record<number, [string[], string[]]>> = {
        "seo-geo": {
          0: [
            ["Service page", "Search result", "Enquiry"],
            ["صفحة الخدمة", "نتيجة البحث", "استفسار"],
          ],
          2: [
            ["Categories", "Product details", "Related items"],
            ["الفئات", "تفاصيل المنتج", "منتجات مرتبطة"],
          ],
          4: [
            ["Question", "Expert answer", "Source"],
            ["السؤال", "إجابة خبيرة", "المصدر"],
          ],
        },
        "digital-marketing": {
          0: [
            ["Campaign", "Landing page", "Enquiry"],
            ["الحملة", "صفحة الهبوط", "استفسار"],
          ],
          2: [
            ["Audience", "Relevant email", "Follow-up"],
            ["الجمهور", "رسالة مناسبة", "المتابعة"],
          ],
          4: [
            ["Channel", "Customer action", "Measurement"],
            ["القناة", "تفاعل العميل", "القياس"],
          ],
        },
        "web-mobile-apps": {
          0: [
            ["Choose date", "Choose time", "Confirm"],
            ["اختر التاريخ", "اختر الموعد", "التأكيد"],
          ],
          2: [
            ["My requests", "Documents", "Current status"],
            ["طلباتي", "المستندات", "الحالة الحالية"],
          ],
          4: [
            ["Account", "Rewards", "Redeem"],
            ["الحساب", "المكافآت", "الاستخدام"],
          ],
        },
        "ai-automation": {
          0: [
            ["Question", "Approved knowledge", "Source"],
            ["السؤال", "المعرفة المعتمدة", "المصدر"],
          ],
          2: [
            ["Extract fields", "Check data", "Approve"],
            ["استخراج الحقول", "تدقيق البيانات", "الموافقة"],
          ],
          4: [
            ["Find procedure", "Access allowed", "Source document"],
            ["البحث عن إجراء", "الصلاحيات", "المستند المصدر"],
          ],
        },
      };
      const rows = mobileRows[slug][index][ar ? 1 : 0];
      const mt = (
        x: number,
        y: number,
        s: string,
        size = 10,
        color = "#26354b",
      ) => text(x, y, s, size, color, ar ? "end" : "start");
      let mobileBody = "";
      rows.forEach((row, n) => {
        const y = 63 + n * 38;
        mobileBody +=
          `<rect x="23" y="${y - 15}" width="134" height="29" fill="${accent}" fill-opacity="${n === 1 ? ".13" : ".05"}"/>` +
          mt(ar ? 148 : 31, y + 3, row, 11, accent);
      });
      mobileBody +=
        '<path d="M26 173h99m-99 10h82" stroke="#bacbd0" stroke-width="3"/>';
      const mobileTitle = lines(c[locale][0], 21)
        .map((line, n) => mt(ar ? 158 : 33, 216 + n * 12, line, 10))
        .join("");
      const mobileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="255" viewBox="0 0 180 255"><defs><filter id="shadow" x="-40%" y="-50%" width="190%" height="210%"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#21384e" flood-opacity=".18"/></filter></defs><g font-family="Arial,sans-serif">${panel(15, 20, 150, 179, `<rect x="15" y="20" width="150" height="18" fill="${accent}"/>` + mobileBody)}${panel(25, 197, 143, 48, mobileTitle)}${panel(3, 5, 116, 29, mt(ar ? 110 : 10, 23, ar ? "تصوّر تطبيقي" : "Application concept", 9, accent))}</g></svg>`;
      const mobileName = name.replace(".svg", "-mobile.svg");
      await fs.writeFile(path.join(root, mobileName), mobileSvg);
      await fs.writeFile(path.join(archive, mobileName), mobileSvg);
    }
  }
}
console.log("Bilingual technical compositions prepared");
