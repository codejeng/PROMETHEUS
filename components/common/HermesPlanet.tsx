"use client";

import { Box } from "@mui/material";
import { motion } from "framer-motion";

interface HermesPlanetProps {
  size?: number;
  /** "spin-in": plays an entrance spin then settles into a slow continuous rotation.
   *  "float": no entrance, always gently spinning — for a persistent floating badge. */
  variant?: "spin-in" | "float";
}

/**
 * Hermes — a small cratered planet with a tilted orbit ring and satellite,
 * echoing the ring motif in the PROMETHEUS logo.
 */
export function HermesPlanet({ size = 36, variant = "spin-in" }: HermesPlanetProps) {
  const ringInset = -size * 0.42;
  const dotSize = Math.max(3, size * 0.09);

  const core = (
    <Box sx={{ position: "relative", width: size, height: size }}>
      {/* orbit ring + satellite, tilted like Saturn's rings */}
      <Box sx={{ position: "absolute", inset: ringInset, transform: "rotate(-20deg)" }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1px solid",
            borderColor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(217,201,163,0.32)" : "rgba(156,130,74,0.35)",
            transform: "scaleY(0.4)",
          }}
        />
        <motion.div
          style={{ position: "absolute", inset: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          <Box sx={{ position: "absolute", inset: 0, transform: "scaleY(0.4)" }}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "100%",
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                bgcolor: "primary.main",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark" ? "0 0 4px rgba(217,201,163,0.7)" : "none",
                transform: "translate(-50%, -50%)",
              }}
            />
          </Box>
        </motion.div>
      </Box>

      {/* sphere body — fixed shading so it reads as lit from one side */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          overflow: "hidden",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at 34% 30%, #6b6558 0%, #45413a 42%, #262420 78%, #17150f 100%)"
              : "radial-gradient(circle at 34% 30%, #b8ab8e 0%, #93876b 42%, #6f6650 78%, #524a39 100%)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "inset -3px -3px 6px rgba(0,0,0,0.6), inset 2px 2px 3px rgba(255,255,255,0.15)"
              : "inset -3px -3px 6px rgba(0,0,0,0.35), inset 2px 2px 3px rgba(255,255,255,0.35)",
        }}
      >
        {/* crater texture — rotates to sell the "spinning surface" illusion */}
        <motion.div
          style={{ position: "absolute", inset: "-15%", borderRadius: "50%" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: (theme) => (theme.palette.mode === "dark" ? 0.55 : 0.4),
              backgroundImage: (theme) => {
                const c = theme.palette.mode === "dark" ? "rgba(0,0,0,0.55)" : "rgba(60,50,30,0.45)";
                return [
                  `radial-gradient(circle at 22% 35%, ${c} 0%, ${c} 6%, transparent 7%)`,
                  `radial-gradient(circle at 58% 20%, ${c} 0%, ${c} 4%, transparent 5%)`,
                  `radial-gradient(circle at 70% 55%, ${c} 0%, ${c} 8%, transparent 9%)`,
                  `radial-gradient(circle at 40% 68%, ${c} 0%, ${c} 5%, transparent 6%)`,
                  `radial-gradient(circle at 15% 62%, ${c} 0%, ${c} 3%, transparent 4%)`,
                  `radial-gradient(circle at 82% 30%, ${c} 0%, ${c} 3%, transparent 4%)`,
                ].join(", ");
              },
            }}
          />
        </motion.div>
      </Box>
    </Box>
  );

  if (variant === "float") {
    return core;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, rotate: -130 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ display: "inline-flex" }}
    >
      {core}
    </motion.div>
  );
}
