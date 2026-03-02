"use client";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className = "",
  interactive = true,
}) => {
  const containerRef = useRef(null);
  const interactiveRef = useRef(null);
  const animationRef = useRef();
  const positionRef = useRef({ curX: 0, curY: 0, tgX: 0, tgY: 0 });

  const animate = useCallback(() => {
    if (!interactiveRef.current) return;
    const { curX, curY, tgX, tgY } = positionRef.current;
    positionRef.current.curX = curX + (tgX - curX) / 20;
    positionRef.current.curY = curY + (tgY - curY) / 20;
    interactiveRef.current.style.transform = `translate(${Math.round(positionRef.current.curX)}px, ${Math.round(positionRef.current.curY)}px)`;
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (interactive) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [interactive, animate]);

  const handleMouseMove = useCallback((event) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      positionRef.current.tgX = event.clientX - rect.left;
      positionRef.current.tgY = event.clientY - rect.top;
    }
  }, []);

  const gradientStyle = {
    width: size,
    height: size,
    mixBlendMode: blendingValue,
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative h-full w-full overflow-hidden bg-linear-to-br ${className}`}
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${gradientBackgroundStart}, ${gradientBackgroundEnd})`,
      }}
    >
      {/* SVG filter for goo effect */}
      <svg style={{ display: "none" }}>
        <defs>
          <filter id="blurMe">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Gradient blobs container */}
      <div className="absolute inset-0" style={{ filter: "url(#blurMe)" }}>
        {/* First blob */}
        <motion.div
          className="absolute rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle at center, rgba(${firstColor}, 0.8) 0, rgba(${firstColor}, 0) 50%)`,
            ...gradientStyle,
            top: "10%",
            left: "10%",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Second blob */}
        <motion.div
          className="absolute rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle at center, rgba(${secondColor}, 0.8) 0, rgba(${secondColor}, 0) 50%)`,
            ...gradientStyle,
            top: "20%",
            right: "10%",
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Third blob */}
        <motion.div
          className="absolute rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle at center, rgba(${thirdColor}, 0.8) 0, rgba(${thirdColor}, 0) 50%)`,
            ...gradientStyle,
            bottom: "10%",
            left: "20%",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Fourth blob */}
        <motion.div
          className="absolute rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle at center, rgba(${fourthColor}, 0.8) 0, rgba(${fourthColor}, 0) 50%)`,
            ...gradientStyle,
            bottom: "20%",
            right: "20%",
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Fifth blob */}
        <motion.div
          className="absolute rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle at center, rgba(${fifthColor}, 0.8) 0, rgba(${fifthColor}, 0) 50%)`,
            ...gradientStyle,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Interactive pointer gradient */}
        {interactive && (
          <div
            ref={interactiveRef}
            className="pointer-events-none absolute rounded-full opacity-70"
            style={{
              background: `radial-gradient(circle at center, rgba(${pointerColor}, 0.8) 0, rgba(${pointerColor}, 0) 50%)`,
              width: size,
              height: size,
              top: "-50%",
              left: "-50%",
              mixBlendMode: blendingValue,
            }}
          />
        )}
      </div>

      {/* Content layer */}
      {children && (
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default function BgAnimation() {
  return (
    <BackgroundGradientAnimation>
      <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center px-4 text-center text-3xl font-bold text-white md:text-4xl lg:text-7xl">
        <p
          style={{
            WebkitTextStroke: "0.5px",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
          className="bg-linear-to-br leading-tight md:leading-tight lg:leading-36 font-bebas tracking-widest text-7xl md:text-8xl   lg:text-9xl text-white/40 from-slate-200 to-slate-300 bg-clip-text py-4 drop-shadow-2xl"
        >
          Route <br />
           Academey
        </p>
      </div>
    </BackgroundGradientAnimation>
  );
}
