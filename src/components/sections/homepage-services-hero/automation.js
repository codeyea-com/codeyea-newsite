// Native layers keep the complete automation sequence seekable and pausable.
const routes = [
  "M54 53H43V34H36",
  "M44 57H36",
  "M54 65H42V76H36",
  "M54 53H65V34H72",
  "M64 57H72",
  "M54 65H66V76H72",
];
const nodeSymbols = {
  invoice:
    '<path d="M7 3h13l7 7v23H7Z M20 3v8h7M11 15h12M11 20h9M11 25h6"/><path d="M22 23c-6-2-7 5-1 5s5 7-1 5m1-12v14"/>',
  cart: '<path d="M3 7h5l4 19h17l5-14H10"/><circle cx="15" cy="32" r="2"/><circle cx="28" cy="32" r="2"/>',
  report: '<path d="M8 3h14l7 7v24H8ZM22 3v9h7M12 17h12M12 22h12M12 27h8"/>',
  data: '<g class="ai-bars"><path d="M7 31V23"/><path d="M17 31V15"/><path d="M27 31V7"/></g><path d="m5 17 10-8 9 3 8-10m-7 0h7v7"/>',
  gear: '<g class="ai-gear"><path d="m16 3 1-3h6l1 3 4 2 4-1 3 5-3 3v5l3 3-3 5-4-1-4 2-1 4h-6l-1-4-4-2-4 1-3-5 3-3v-5L5 9l3-5 4 1Z" transform="translate(0 3) scale(.9)"/><circle cx="18" cy="16.5" r="5"/></g><path d="m28 26 3-1 3 3-1 3 1 3-3 3-3-1-3 1-3-3 1-3-1-3 3-3Z"/><circle cx="28" cy="31" r="2"/>',
  target:
    '<circle cx="17" cy="21" r="13"/><circle cx="17" cy="21" r="7"/><path d="m17 21 15-16m-2-4 6 0v6l-5 5-6-1 0-6Z"/>',
};
function symbol(name) {
  return `<svg class="ai-node-symbol" viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${nodeSymbols[name]}</svg>`;
}

export function automationScene({ label, icon, name }) {
  const nodes = [
    ["invoice", label("الفواتير", "INVOICES"), "left", "top"],
    ["cart", label("طلبات الشراء", "PURCHASE ORDERS"), "left", "middle"],
    ["report", label("تقارير المصروفات", "EXPENSE REPORTS"), "left", "bottom"],
    ["data", label("استخراج البيانات", "DATA EXTRACTION"), "right", "top"],
    ["gear", label("أتمتة الإجراءات", "PROCESS AUTOMATION"), "right", "middle"],
    [
      "target",
      label("الدقة والكفاءة", "ACCURACY & EFFICIENCY"),
      "right",
      "bottom",
    ],
  ];
  return `<div class="scene automation-scene" data-scene="3" role="tabpanel" id="panel-3" aria-label="${name}">
    <div class="layer ai-connections" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${routes.map((d, i) => `<g data-flow="${i}"><path class="ai-route-track" d="${d}"/><path class="ai-route" d="${d}" pathLength="1"/><circle class="ai-packet" r=".55"/></g>`).join("")}</svg></div>
    <div class="layer ai-core" data-motion="pop" data-start=".2" data-duration="1"><div class="ai-core-pins" aria-hidden="true">${Array.from({ length: 4 }, (_, side) => `<div class="pins pins-${side}">${"<i></i>".repeat(7)}</div>`).join("")}</div><div class="ai-chip"><span>CODEYEA</span><b>AI</b><small>${label("ذكاء يربط أعمالك", "CONNECTED INTELLIGENCE")}</small></div></div>
    ${nodes.map(([type, title, side, row], i) => `<div class="layer ai-node ai-node-${side} ai-node-${row}" data-node="${i}" data-motion="rise" data-start="${0.55 + i * 0.12}"><span class="ai-node-title">${title}</span><div class="ai-node-content">${symbol(type)}<div class="ai-node-lines" aria-hidden="true"><i></i><i></i><i></i></div><span class="ai-node-check" aria-hidden="true">${icon("check")}</span></div></div>`).join("")}
    <div class="layer automation-agent" data-motion="rise" data-start=".65"><div class="automation-agent-label">${icon("robot")}<b>AI Agent</b><span>CODEYEA</span></div><div class="automation-status" role="status" aria-live="off"><i class="automation-status-dot"></i><span class="automation-status-text">Start automation</span><span class="automation-status-tail">.....</span><span class="automation-status-check">${icon("check")}</span></div></div>
    <div class="layer ai-tools ai-tools-left"><div class="ai-tool" data-motion="pop" data-start="1.0"><img src="/homepage/services-hero/googlegemini.svg" alt="Google Gemini"><span>Gemini</span></div><div class="ai-tool" data-motion="pop" data-start="1.2"><img src="/homepage/services-hero/claude.svg" alt="Claude"><span>Claude</span></div></div>
    <div class="layer ai-tools ai-tools-right"><div class="ai-tool" data-motion="pop" data-start="1.4"><img src="/homepage/services-hero/n8n.svg" alt="n8n"><span>n8n</span></div></div>
  </div>`;
}

const pathLengths = new WeakMap();
export function renderAutomation(scene, t, { ease, range, reduced }) {
  const submitted = t >= 5.7;
  scene.classList.toggle("is-submitted", submitted);
  const status = scene.querySelector(".automation-status"),
    text = status.querySelector(".automation-status-text");
  const statusLabel = submitted ? "Submitted" : "Start automation";
  if (text.textContent !== statusLabel) text.textContent = statusLabel;
  status.style.opacity =
    submitted || reduced
      ? "1"
      : String(0.58 + 0.42 * (0.5 + 0.5 * Math.sin(t * 8)));
  scene.querySelectorAll("[data-flow]").forEach((group, i) => {
    const path = group.querySelector(".ai-route"),
      packet = group.querySelector(".ai-packet"),
      start = 1.7 + i * 0.18,
      p = ease(range(t, start, 1.3));
    path.style.strokeDashoffset = 1 - p;
    if (!pathLengths.has(path)) pathLengths.set(path, path.getTotalLength());
    const travel = reduced ? 1 : Math.max(0, (t - start) % 1.7) / 1.7,
      point = path.getPointAtLength(pathLengths.get(path) * travel);
    packet.setAttribute("cx", point.x);
    packet.setAttribute("cy", point.y);
    packet.style.opacity = t > start && !reduced ? ".95" : "0";
  });
  scene.querySelectorAll(".ai-node").forEach((node, i) => {
    const p = ease(range(t, 2.6 + i * 0.3, 0.75));
    node.style.setProperty("--node-ready", String(p));
    node.querySelector(".ai-node-check").style.transform = `scale(${p})`;
    node
      .querySelectorAll(".ai-node-lines i")
      .forEach(
        (line, j) =>
          (line.style.transform = `scaleX(${Math.max(0.05, p * (1 - j * 0.17))})`),
      );
  });
  scene.querySelector(".ai-bars").style.transform =
    `scaleY(${0.1 + 0.9 * ease(range(t, 3.0, 1.3))})`;
  scene.querySelector(".ai-gear").style.transform =
    `rotate(${reduced ? 20 : t * 22}deg)`;
  scene
    .querySelector(".ai-chip")
    .style.setProperty(
      "--core-glow",
      String(reduced ? 0.45 : 0.35 + 0.18 * Math.sin(t * 2)),
    );
}
