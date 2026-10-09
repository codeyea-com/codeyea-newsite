"use client";
import { useEffect, useRef, type PointerEvent } from "react";
type ActionElement = HTMLAnchorElement | HTMLButtonElement;
export function FlowAction({ href, label }: { href?: string; label?: string }) {
  const circleRef = useRef<HTMLSpanElement>(null);
  const motion = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, frame: 0, previous: 0 });
  useEffect(() => {
    const state = motion.current;
    const preference = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const clearMotion = () => {
      cancelAnimationFrame(state.frame);
      state.frame = 0;
      state.x = state.y = state.targetX = state.targetY = 0;
      circleRef.current?.style.setProperty("--plus-x", "0px");
      circleRef.current?.style.setProperty("--plus-y", "0px");
    };
    preference.addEventListener("change", clearMotion);
    return () => { cancelAnimationFrame(state.frame); preference.removeEventListener("change", clearMotion); };
  }, []);
  const animate = () => {
    const state = motion.current;
    if (state.frame) return;
    state.previous = 0;
    const tick = (time: number) => {
      const elapsed = state.previous ? Math.min(time - state.previous, 64) : 16;
      state.previous = time;
      const blend = 1 - Math.exp(-elapsed / 100);
      state.x += (state.targetX - state.x) * blend;
      state.y += (state.targetY - state.y) * blend;
      const settled = Math.abs(state.targetX - state.x) < 0.01 && Math.abs(state.targetY - state.y) < 0.01;
      if (settled) { state.x = state.targetX; state.y = state.targetY; }
      circleRef.current?.style.setProperty("--plus-x", `${state.x}px`);
      circleRef.current?.style.setProperty("--plus-y", `${state.y}px`);
      state.frame = settled ? 0 : requestAnimationFrame(tick);
    };
    state.frame = requestAnimationFrame(tick);
  };
  const reset = () => { motion.current.targetX = 0; motion.current.targetY = 0; animate(); };
  const follow = (event: PointerEvent<ActionElement>) => {
    const finePointer = event.pointerType !== "touch" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    event.currentTarget.dataset.pointerHover = String(finePointer);
    if (!finePointer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const circle = circleRef.current;
    if (!circle) return;
    const box = circle.getBoundingClientRect();
    const clamp = (value: number) => Math.max(-4, Math.min(4, value));
    motion.current.targetX = clamp((event.clientX - box.left - box.width / 2) / (box.width / 2) * 4);
    motion.current.targetY = clamp((event.clientY - box.top - box.height / 2) / (box.height / 2) * 4);
    animate();
  };
  const leave = (event: PointerEvent<ActionElement>) => { event.currentTarget.dataset.pointerHover = "false"; event.currentTarget.dataset.pointerPressed = "false"; reset(); };
  const interaction = { className: "hp-flow-action", onPointerDown: (event: PointerEvent<ActionElement>) => { event.currentTarget.dataset.touch = String(event.pointerType === "touch"); event.currentTarget.dataset.pointerPressed = "true"; }, onPointerUp: (event: PointerEvent<ActionElement>) => { event.currentTarget.dataset.pointerPressed = "false"; }, onPointerEnter: follow, onPointerMove: follow, onPointerLeave: leave, onPointerCancel: leave, onBlur: reset };
  const content = <><span ref={circleRef} className="hp-flow-action-circle" aria-hidden="true"><span>+</span></span><span className="hp-flow-action-label">{label || "Explore Details"}</span></>;
  return href?.trim() ? <a {...interaction} href={href}>{content}</a> : <button {...interaction} type="button">{content}</button>;
}

