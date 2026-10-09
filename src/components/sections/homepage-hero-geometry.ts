export type Point3D = { x: number; y: number; z: number };
export type BandFace = {
  points: [Point3D, Point3D, Point3D];
  arc: number;
  surface: "front" | "back" | "outer" | "inner";
  alpha: number;
  tint: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

function shapedPoint(theta: number, radius: number, z: number, service: number): Point3D {
  const swell = 1 + 0.13 * Math.sin(theta * 2 + service * 0.52);
  const twist = 0.24 * Math.sin(theta * 2.4 + service * 0.68);
  return {
    x: Math.cos(theta) * radius * (0.98 + 0.075 * Math.sin(service * 0.55)),
    y: Math.sin(theta) * radius * (1.02 + 0.07 * Math.cos(service * 0.48)),
    z: z + twist + (swell - 1) * 0.3,
  };
}

function dissolveAlpha(arc: number, progress: number) {
  if (progress >= 1) return 1;
  const envelope = Math.abs(progress - 0.5) * 2;
  const stagger = Math.abs(arc - 0.5) * 0.14;
  return clamp01((envelope - stagger) / 0.86);
}

export function buildMorphBand(fromService: number, toService: number, progress: number): BandFace[] {
  const p = clamp01(progress);
  const morph = smoothstep(0, 1, p);
  const service = fromService + (toService - fromService) * morph;
  const faces: BandFace[] = [];
  const segments = 24;
  const start = -2.36;
  const end = 2.36;
  const outerRadius = 1.18;
  const innerRadius = 0.67;
  const depth = 0.19;

  const add = (
    points: [Point3D, Point3D, Point3D],
    arc: number,
    surface: BandFace["surface"],
    tint: number,
  ) => faces.push({ points, arc, surface, alpha: dissolveAlpha(arc, p), tint });

  for (let segment = 0; segment < segments; segment++) {
    const t0 = segment / segments;
    const t1 = (segment + 1) / segments;
    const a0 = start + (end - start) * t0;
    const a1 = start + (end - start) * t1;
    const outer0Front = shapedPoint(a0, outerRadius, depth, service);
    const outer1Front = shapedPoint(a1, outerRadius, depth, service);
    const inner0Front = shapedPoint(a0, innerRadius, depth, service);
    const inner1Front = shapedPoint(a1, innerRadius, depth, service);
    const outer0Back = shapedPoint(a0, outerRadius, -depth, service);
    const outer1Back = shapedPoint(a1, outerRadius, -depth, service);
    const inner0Back = shapedPoint(a0, innerRadius, -depth, service);
    const inner1Back = shapedPoint(a1, innerRadius, -depth, service);
    const alpha = (t0 + t1) / 2;
    const tint = Math.sin(segment * 12.9898 + toService * 7.17) * 0.5 + 0.5;

    add([outer0Front, outer1Front, inner1Front], alpha, "front", tint);
    add([outer0Front, inner1Front, inner0Front], alpha, "front", 1 - tint);
    add([outer1Back, outer0Back, inner0Back], alpha, "back", tint);
    add([outer1Back, inner0Back, inner1Back], alpha, "back", 1 - tint);
    add([outer0Front, outer0Back, outer1Back], alpha, "outer", tint);
    add([outer0Front, outer1Back, outer1Front], alpha, "outer", 1 - tint);
    add([inner0Back, inner0Front, inner1Front], alpha, "inner", tint);
    add([inner0Back, inner1Front, inner1Back], alpha, "inner", 1 - tint);
  }

  return faces;
}
