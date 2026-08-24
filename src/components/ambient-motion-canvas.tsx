"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; radius: number; speed: number; drift: number; alpha: number };

export function AmbientMotionCanvas({ className = "wow-story-canvas" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (navigator.userAgent.toLowerCase().includes("jsdom")) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let animationFrame = 0;
    const particles: Particle[] = Array.from({ length: 34 }, (_, index) => ({
      x: ((index * 83) % 997) / 997,
      y: ((index * 47) % 991) / 991,
      radius: 1 + (index % 4) * 0.7,
      speed: 0.00018 + (index % 5) * 0.000035,
      drift: ((index % 7) - 3) * 0.000025,
      alpha: 0.22 + (index % 5) * 0.1,
    }));

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);

      const sweep = (Math.sin(frame * 0.009) + 1) / 2;
      const gradient = context.createLinearGradient(width * (sweep - 0.35), 0, width * (sweep + 0.35), height);
      gradient.addColorStop(0, "rgba(217,255,67,0)");
      gradient.addColorStop(0.5, "rgba(217,255,67,0.16)");
      gradient.addColorStop(1, "rgba(217,255,67,0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.moveTo(width * (sweep - 0.28), 0);
      context.lineTo(width * (sweep + 0.06), 0);
      context.lineTo(width * (sweep + 0.38), height);
      context.lineTo(width * (sweep - 0.12), height);
      context.closePath();
      context.fill();

      for (const particle of particles) {
        particle.y -= particle.speed;
        particle.x += particle.drift;
        if (particle.y < -0.03) particle.y = 1.03;
        if (particle.x < -0.03) particle.x = 1.03;
        if (particle.x > 1.03) particle.x = -0.03;
        const pulse = 0.55 + Math.sin(frame * 0.025 + particle.x * 12) * 0.45;
        context.beginPath();
        context.arc(particle.x * width, particle.y * height, particle.radius * pulse, 0, Math.PI * 2);
        context.fillStyle = `rgba(229,255,131,${particle.alpha * pulse})`;
        context.shadowColor = "rgba(217,255,67,.9)";
        context.shadowBlur = 12;
        context.fill();
      }
      context.shadowBlur = 0;
      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
