"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Le billet du hero : il « sort de l'imprimante » au chargement (le seul
 * mouvement non sollicité de la page), puis suit légèrement le pointeur.
 */
export function HeroTicket({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 140, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 140, damping: 18 });
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);

  return (
    <div
      className="relative [perspective:1400px]"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        initial={reduce ? false : { y: 90, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: -5 }}
        transition={{ duration: 1.1, delay: 0.35, ease: [0.25, 1, 0.5, 1] }}
        style={{ rotateX: rx, rotateY: ry }}
        className="relative"
      >
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.4cqw] mix-blend-soft-light"
          style={{
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 48%, transparent 62%)",
            backgroundSize: "250% 100%",
            backgroundPositionX: glareX,
          }}
        />
      </motion.div>
    </div>
  );
}
