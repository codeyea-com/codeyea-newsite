'use client';

import { useEffect, useRef, useState } from 'react';

type Vertex = [number, number, number];
type Mode = { eyebrow: string; title: string; body: string };

const modes: Mode[] = [
  { eyebrow: '01 / DIGITAL PLATFORMS', title: 'Build with purpose.', body: 'Websites and applications shaped around the people who use them.' },
  { eyebrow: '02 / CONNECTED WORKFLOWS', title: 'Make work flow.', body: 'Commerce, systems and automation working together.' },
  { eyebrow: '03 / ROOM TO GROW', title: 'Ready for what’s next.', body: 'A stronger digital foundation for the next stage of your business.' },
];

function pointAt(mode: number, latitude: number, longitude: number): Vertex {
  const phi = -Math.PI / 2 + (Math.PI * latitude);
  const theta = longitude * Math.PI * 2;
  const cosPhi = Math.cos(phi);
  const x = cosPhi * Math.cos(theta);
  const y = Math.sin(phi);
  const z = cosPhi * Math.sin(theta);
  let radius: number;

  if (mode === 0) {
    const cube = 1 / Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
    radius = 0.78 + (cube - 1) * 0.5;
  } else if (mode === 1) {
    const ribs = Math.cos(phi * 22 + theta * 0.72);
    radius = 0.83 + ribs * 0.105 * Math.pow(Math.max(0, cosPhi), 0.45);
  } else {
    const facets = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
    const cuts = Math.abs(Math.sin(theta * 4 + phi * 1.6));
    radius = 0.75 + facets * 0.18 + cuts * 0.065 * Math.pow(Math.max(0, cosPhi), 0.6);
  }

  return [x * radius, y * radius, z * radius];
}

function subtract(a: Vertex, b: Vertex): Vertex { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function cross(a: Vertex, b: Vertex): Vertex { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function unit(a: Vertex): Vertex { const length = Math.hypot(...a) || 1; return [a[0] / length, a[1] / length, a[2] / length]; }
function dot(a: Vertex, b: Vertex): number { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

function buildMesh(mode: number) {
  const rows = 32, columns = 48;
  const grid: Vertex[][] = Array.from({ length: rows + 1 }, (_, row) =>
    Array.from({ length: columns + 1 }, (_, column) => pointAt(mode, row / rows, column / columns)),
  );
  const positions: number[] = [];
  const normals: number[] = [];
  const addTriangle = (first: Vertex, second: Vertex, third: Vertex) => {
    let normal = unit(cross(subtract(second, first), subtract(third, first)));
    const center = unit([first[0] + second[0] + third[0], first[1] + second[1] + third[1], first[2] + second[2] + third[2]]);
    if (dot(normal, center) < 0) { [second, third] = [third, second]; normal = [-normal[0], -normal[1], -normal[2]]; }
    for (const point of [first, second, third]) { positions.push(...point); normals.push(...normal); }
  };
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const a = grid[row][column], b = grid[row][column + 1], c = grid[row + 1][column], d = grid[row + 1][column + 1];
      addTriangle(a, b, c); addTriangle(b, d, c);
    }
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals) };
}

const meshes = [buildMesh(0), buildMesh(1), buildMesh(2)];

function MorphingCore({ mode, playing }: { mode: number; playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previousMode = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;
    const fromMode = previousMode.current;
    const toMode = mode;
    previousMode.current = mode;
    const start = performance.now();
    const from = meshes[fromMode], to = meshes[toMode];
    let frame = 0, disposed = false, visible = false, width = 1, height = 1;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const render = (now: number) => {
      if (disposed) return;
      const elapsed = now - start;
      const transition = fromMode === toMode ? 1 : Math.min(1, elapsed / 1900);
      const morph = transition * transition * (3 - 2 * transition);
      const rotation = (media.matches || !playing ? 0 : now * 0.00021) + 0.34;
      const tilt = -0.24 + Math.sin(now * 0.00016) * (media.matches || !playing ? 0 : 0.055);
      const cx = Math.cos(tilt), sx = Math.sin(tilt), cy = Math.cos(rotation), sy = Math.sin(rotation);
      const aspect = width / height;
      const triangles: { points: [number, number][], depth: number, light: [number, number, number, number] }[] = [];
      for (let i = 0; i < from.positions.length; i += 9) {
        const local: Vertex[] = [], transformed: { x: number; y: number; z: number }[] = [];
        for (let vertex = 0; vertex < 3; vertex++) {
          const offset = i + vertex * 3;
          const point: Vertex = [
            from.positions[offset] + (to.positions[offset] - from.positions[offset]) * morph,
            from.positions[offset + 1] + (to.positions[offset + 1] - from.positions[offset + 1]) * morph,
            from.positions[offset + 2] + (to.positions[offset + 2] - from.positions[offset + 2]) * morph,
          ];
          local.push(point);
          const x = point[0] * cy - point[2] * sy;
          const rz = point[0] * sy + point[2] * cy;
          transformed.push({ x, y: point[1] * cx - rz * sx, z: point[1] * sx + rz * cx });
        }
        const normal: Vertex = [
          from.normals[i] + (to.normals[i] - from.normals[i]) * morph,
          from.normals[i + 1] + (to.normals[i + 1] - from.normals[i + 1]) * morph,
          from.normals[i + 2] + (to.normals[i + 2] - from.normals[i + 2]) * morph,
        ];
        const nx = normal[0] * cy - normal[2] * sy;
        const nz = normal[0] * sy + normal[2] * cy;
        const n: Vertex = [nx, normal[1] * cx - nz * sx, normal[1] * sx + nz * cx];
        if (n[2] <= 0.015) continue;
        const warmDirection = unit([-0.55, 0.72, 0.72]);
        const tealDirection = unit([0.85, -0.25, 0.46]);
        const view = unit([0, 0, 1]);
        const warm = Math.max(0, dot(n, warmDirection));
        const teal = Math.max(0, dot(n, tealDirection));
        const warmSpec = Math.pow(Math.max(0, dot(n, unit([warmDirection[0], warmDirection[1], warmDirection[2] + 1]))), 38);
        const tealSpec = Math.pow(Math.max(0, dot(n, unit([tealDirection[0], tealDirection[1], tealDirection[2] + view[2]]))), 42);
        const projected = transformed.map((p) => {
          const perspective = 2.35 / (3.05 - p.z * 0.34);
          return [width * (0.5 + p.x * perspective / aspect * 0.47), height * (0.5 - p.y * perspective * 0.47)] as [number, number];
        });
        triangles.push({ points: projected, depth: transformed.reduce((sum, p) => sum + p.z, 0) / 3, light: [warm, teal, warmSpec, tealSpec] });
      }
      triangles.sort((a, b) => a.depth - b.depth);
      context.clearRect(0, 0, width, height);
      for (const triangle of triangles) {
        const [warm, teal, warmSpec, tealSpec] = triangle.light;
        const [r, g, b] = [24 + warm * 22 + teal * 2 + warmSpec * 145 + tealSpec * 10, 29 + warm * 25 + teal * 25 + warmSpec * 135 + tealSpec * 128, 37 + warm * 28 + teal * 38 + warmSpec * 125 + tealSpec * 168];
        context.beginPath(); context.moveTo(...triangle.points[0]); context.lineTo(...triangle.points[1]); context.lineTo(...triangle.points[2]); context.closePath();
        context.fillStyle = `rgb(${r | 0} ${g | 0} ${b | 0})`; context.fill();
      }
      if (playing && !media.matches && visible && !document.hidden) frame = requestAnimationFrame(render);
    };
    const resize = new ResizeObserver(([entry]) => {
      const dpr = Math.min(1.75, window.devicePixelRatio || 1);
      width = Math.max(1, Math.round(entry.contentRect.width * dpr)); height = Math.max(1, Math.round(entry.contentRect.height * dpr));
      canvas.width = width; canvas.height = height; frame = requestAnimationFrame(render);
    });
    resize.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: 0.05 });
    intersection.observe(canvas);
    const schedule = () => {
      cancelAnimationFrame(frame);
      if (playing && !media.matches && visible && !document.hidden) frame = requestAnimationFrame(render);
      else render(performance.now());
    };
    const onMotion = () => schedule();
    media.addEventListener('change', onMotion); document.addEventListener('visibilitychange', onMotion);
    schedule();
    return () => { disposed = true; cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect(); media.removeEventListener('change', onMotion); document.removeEventListener('visibilitychange', onMotion); };
  }, [mode, playing]);

  return <canvas ref={canvasRef} className="motion-core" aria-label="A three-dimensional metallic core morphing between faceted and ribbed forms" />;
}

export function HomepageHeroMotionPrototype() {
  const [mode, setMode] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setMode((current) => (current + 1) % modes.length), 6200);
    return () => window.clearInterval(timer);
  }, [playing]);
  const active = modes[mode];

  return (
    <main className="motion-prototype">
      <header className="motion-header">
        <a href="/preview" className="motion-wordmark" aria-label="Return to homepage preview">CODEYEA<span>®</span></a>
        <div className="motion-nav-label">DIGITAL INNOVATION AGENCY</div>
        <a className="motion-header-cta" href="/preview#contact">Let’s talk <span>↗</span></a>
      </header>
      <section className="motion-hero" aria-labelledby="motion-title">
        <div className="motion-copy">
          <p className="motion-kicker"><span /> DIGITAL EXPERIENCES <i>/</i> CODEYEA</p>
          <h1 id="motion-title">Digital experiences<br /><em>built for what’s next.</em></h1>
          <p className="motion-intro">Websites, online stores and smarter workflows, shaped around your business.</p>
          <div className="motion-active-copy" key={active.eyebrow}>
            <span>{active.eyebrow}</span>
            <h2>{active.title}</h2>
            <p>{active.body}</p>
          </div>
          <div className="motion-actions">
            <a href="/preview#contact" className="motion-primary">Get your free quote <span>↗</span></a>
            <a href="/preview#services" className="motion-secondary">Explore services <span>↓</span></a>
          </div>
          <div className="motion-controls" aria-label="Three-dimensional transformation controls">
            {modes.map((item, index) => <button key={item.eyebrow} type="button" className={mode === index ? 'is-active' : ''} onClick={() => setMode(index)} aria-label={`Show form ${index + 1}: ${item.eyebrow.split('/ ')[1]}`} aria-pressed={mode === index}><span>{String(index + 1).padStart(2, '0')}</span></button>)}
            <span className="motion-controls-label">FORM IN MOTION</span>
            <button type="button" className="motion-play" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause animation' : 'Play animation'}>{playing ? 'Ⅱ' : '▶'}</button>
          </div>
        </div>
        <div className="motion-stage" aria-label={`Three-dimensional form: ${active.title}`}>
          <div className="motion-aura" aria-hidden="true" />
          <div className="motion-orbit motion-orbit-one" aria-hidden="true" />
          <div className="motion-orbit motion-orbit-two" aria-hidden="true" />
          <MorphingCore mode={mode} playing={playing} />
          <div className="motion-stage-label"><span>FORM / {String(mode + 1).padStart(2, '0')}</span><b>{active.eyebrow.split('/ ')[1]}</b></div>
          <span className="motion-stage-note">SHAPE FOLLOWS THE WORK</span>
        </div>
      </section>
      <section className="motion-services" aria-label="CODEYEA capabilities">
        <div className="motion-services-heading"><span>WHAT WE DO</span><b>One team. Connected digital work.</b></div>
        {['Web & App Development', 'eCommerce Solutions', 'AI & Automation'].map((label, index) => <button key={label} type="button" onClick={() => setMode(index)} className={mode === index ? 'is-active' : ''}><span>0{index + 1}</span><b>{label}</b><i>↗</i></button>)}
      </section>
      <div className="motion-footer"><span>CODEYEA · DIGITAL INNOVATION</span><span>{String(mode + 1).padStart(2, '0')} / 03 <i>SCROLL TO EXPLORE ↓</i></span></div>
    </main>
  );
}
