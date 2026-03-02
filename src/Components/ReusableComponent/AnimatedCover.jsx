import { motion } from "framer-motion";

/**
 * AnimatedCover Component
 *
 * Props:
 * - title: string (default: "ROUTE")
 * - subtitle: string (default: "Your Social Space")
 * - height: string (default: "h-72")  → any Tailwind height class
 */

export default function AnimatedCover({
  title = "ROUTE",
  subtitle = "Your Social Space",
  height = "h-72",
}) {
  const particles = Array.from({ length: 18 });
  const rings = [320, 240, 160, 80];

  return (
    <div
      className={`relative ${height} w-full overflow-hidden`}
      style={{
        background:
          "linear-gradient(135deg, #1e003d 0%, #3b0764 30%, #5b21b6 60%, #2e1065 100%)",
      }}
    >
      {/* ── Grid lines ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* ── Pulsing rings ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        {rings.map((size, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-purple-400"
            style={{ width: size, height: size }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.15, 0.4, 0.15] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: i * 0.55,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── Ambient orb — top left ── */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: 220,
          height: 220,
          background: "radial-gradient(circle, #7c3aed88, transparent 70%)",
          top: "-40px",
          left: "-40px",
        }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Ambient orb — bottom right ── */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: 260,
          height: 260,
          background: "radial-gradient(circle, #a855f766, transparent 70%)",
          bottom: "-60px",
          right: "-40px",
        }}
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Ambient orb — center right ── */}
      <motion.div
        className="absolute rounded-full blur-2xl"
        style={{
          width: 120,
          height: 120,
          background: "radial-gradient(circle, #c084fc55, transparent 70%)",
          top: "30%",
          right: "25%",
        }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Floating particles ── */}
      {particles.map((_, i) => {
        const size = 2 + (i % 5);
        const x = (i * 37 + 11) % 100;
        const y = (i * 53 + 7) % 100;
        const dur = 4 + (i % 6);
        const delay = (i * 0.4) % 4;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-purple-300"
            style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: dur,
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
          />
        );
      })}

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: -20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative flex flex-col items-center"
        >
          <div
            className="absolute inset-0 blur-2xl rounded-full"
            style={{
              background:
                "radial-gradient(ellipse, #a855f666 0%, transparent 70%)",
              transform: "scale(2)",
            }}
          />

          {subtitle && (
            <motion.p
              className="relative z-10 mb-3 text-xs tracking-[0.45em] uppercase font-semibold px-4 py-1 rounded-full border border-purple-400/50 text-center"
              style={{
                color: "#e9d5ff",
                background: "rgba(109, 40, 217, 0.35)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 0 12px rgba(168,85,247,0.3)",
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Title */}
          <motion.h1
            className="relative z-10 font-black tracking-[0.35em] text-transparent select-none"
            style={{
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              backgroundImage:
                "linear-gradient(135deg, #e9d5ff 0%, #a78bfa 40%, #fff 60%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            {title}
          </motion.h1>
        </motion.div>
      </div>

      {/* ── Bottom fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(30,0,61,0.4))",
        }}
      />
    </div>
  );
}
