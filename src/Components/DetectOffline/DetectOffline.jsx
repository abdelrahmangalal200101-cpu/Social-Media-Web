import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Radio } from "lucide-react";

const OrbitRing = ({ radius, duration, delay, dotSize = 6, color }) => (
  <motion.div
    className="absolute inset-0 flex items-center justify-center"
    animate={{ rotate: 360 }}
    transition={{ duration, repeat: Infinity, ease: "linear", delay }}
  >
    <div
      className="absolute rounded-full"
      style={{
        width: dotSize,
        height: dotSize,
        background: color,
        top: `calc(50% - ${radius}px - ${dotSize / 2}px)`,
        left: `calc(50% - ${dotSize / 2}px)`,
        boxShadow: `0 0 ${dotSize * 2}px ${color}`,
      }}
    />
  </motion.div>
);

const FloatingParticle = ({ x, y, duration, delay, size }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      background: "radial-gradient(circle, rgba(167,139,250,0.6), transparent)",
    }}
    animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0], scale: [0.5, 1.2, 0.5] }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const GridLine = ({ isHorizontal, position }) => (
  <motion.div
    className="absolute"
    style={{
      [isHorizontal ? "top" : "left"]: `${position}%`,
      [isHorizontal ? "left" : "top"]: 0,
      [isHorizontal ? "width" : "height"]: "100%",
      [isHorizontal ? "height" : "width"]: "1px",
      background: "rgba(139,92,246,0.08)",
    }}
    animate={{ opacity: [0, 1, 0] }}
    transition={{
      duration: 3,
      repeat: Infinity,
      delay: position * 0.05,
      ease: "easeInOut",
    }}
  />
);

// ─── الـ overlay نفسه ───────────────────────────────────────────────
function OfflineOverlay() {
  const [particles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 3 + Math.random() * 3,
      delay: Math.random() * 3,
      size: Math.random() * 8 + 4,
    }))
  );

  const gridPositions = [11, 22, 33, 44, 55, 66, 77, 88];

  return (
    <motion.div
      key="offline-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(88,28,135,0.95) 0%, rgba(15,10,30,0.99) 50%, rgba(30,15,60,0.98) 100%)",
      }}
    >
      {/* Grid */}
      {gridPositions.map((pos) => (
        <GridLine key={`h${pos}`} isHorizontal position={pos} />
      ))}
      {gridPositions.map((pos) => (
        <GridLine key={`v${pos}`} isHorizontal={false} position={pos} />
      ))}

      {/* Particles */}
      {particles.map((p) => (
        <FloatingParticle key={p.id} {...p} />
      ))}

      {/* Ambient glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ scale: 0.88, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.88, y: 40, opacity: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1], // expo out — silky smooth
        }}
        className="relative flex flex-col items-center gap-8 px-10 py-12 rounded-3xl text-center"
        style={{
          background:
            "linear-gradient(145deg, rgba(88,28,135,0.35) 0%, rgba(30,15,60,0.5) 100%)",
          border: "1px solid rgba(167,139,250,0.2)",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          maxWidth: 420,
          width: "90%",
        }}
      >
        {/* Top shimmer line */}
        <motion.div
          className="absolute top-0 left-8 right-8 h-px rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)",
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Orbit system */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 140, height: 140 }}
        >
          <OrbitRing
            radius={58}
            duration={6}
            delay={0}
            dotSize={8}
            color="rgba(167,139,250,0.9)"
          />
          <OrbitRing
            radius={42}
            duration={4}
            delay={0.5}
            dotSize={5}
            color="rgba(196,181,253,0.7)"
          />
          <OrbitRing
            radius={70}
            duration={10}
            delay={1}
            dotSize={4}
            color="rgba(139,92,246,0.5)"
          />

          {[58, 42, 70].map((r, i) => (
            <div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: r * 2,
                height: r * 2,
                borderColor: `rgba(139,92,246,${0.15 - i * 0.03})`,
              }}
            />
          ))}

          {/* Center icon */}
          <motion.div
            className="relative flex items-center justify-center rounded-2xl z-10"
            style={{
              width: 56,
              height: 56,
              background:
                "linear-gradient(135deg, rgba(109,40,217,0.8), rgba(76,29,149,0.9))",
              boxShadow:
                "0 0 30px rgba(109,40,217,0.6), 0 0 60px rgba(109,40,217,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
              border: "1px solid rgba(167,139,250,0.4)",
            }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <WifiOff size={24} className="text-purple-200" strokeWidth={2} />
          </motion.div>
        </div>

        {/* Text — staggered entrance */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
          }}
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="text-white text-2xl font-bold tracking-tight"
          >
            You're Offline
          </motion.h2>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="text-purple-300 text-sm leading-relaxed"
            style={{ maxWidth: 280 }}
          >
            No internet connection detected. Check your network settings and try
            again.
          </motion.p>
        </motion.div>

        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: "rgba(88,28,135,0.4)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-purple-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-purple-300 text-xs font-medium flex items-center gap-1.5">
            <Radio size={11} />
            Scanning for connection...
          </span>
        </motion.div>

        {/* Signal bars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex items-end gap-1.5"
        >
          {[30, 50, 70, 100].map((h, i) => (
            <motion.div
              key={i}
              className="w-2 rounded-sm"
              style={{
                height: `${h * 0.22}rem`,
                background:
                  i < 2
                    ? "rgba(139,92,246,0.5)"
                    : "rgba(139,92,246,0.12)",
              }}
              animate={i < 2 ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>

        {/* Bottom shimmer */}
        <motion.div
          className="absolute bottom-0 left-8 right-8 h-px rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Export الرئيسي — بيعمل AnimatePresence جوّاه ────────────────────
export default function DetectOffline({ show }) {
  return (
    <AnimatePresence mode="wait">
      {show && <OfflineOverlay />}
    </AnimatePresence>
  );
}