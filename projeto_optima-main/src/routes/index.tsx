import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Optima" },
      { name: "description", content: "EQUIPAMENTOS CNC" },
      { property: "og:title", content: "Optima" },
      { property: "og:description", content: "EQUIPAMENTOS CNC" },
    ],
  }),
  component: Index,
});

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnParticle = () => {
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0, vx = 0, vy = 0;
      const speed = 0.3 + Math.random() * 0.5;

      switch (side) {
        case 0:
          x = Math.random() * canvas.width;
          y = -10;
          vx = (Math.random() - 0.5) * speed;
          vy = Math.random() * speed;
          break;
        case 1:
          x = canvas.width + 10;
          y = Math.random() * canvas.height;
          vx = -Math.random() * speed;
          vy = (Math.random() - 0.5) * speed;
          break;
        case 2:
          x = Math.random() * canvas.width;
          y = canvas.height + 10;
          vx = (Math.random() - 0.5) * speed;
          vy = -Math.random() * speed;
          break;
        case 3:
          x = -10;
          y = Math.random() * canvas.height;
          vx = Math.random() * speed;
          vy = (Math.random() - 0.5) * speed;
          break;
      }

      particles.push({
        x,
        y,
        vx,
        vy,
        size: 1 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.4,
        decay: 0.002 + Math.random() * 0.003,
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (particles.length < 60 && Math.random() < 0.08) {
        spawnParticle();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `rgba(200, 50, 50, ${p.alpha})`);
        gradient.addColorStop(0.5, `rgba(150, 30, 30, ${p.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(150, 30, 30, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />

      {/* Animated particles canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
      />

      {/* Decorative lines */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[1px] w-[40vw] bg-gradient-to-r from-transparent via-crimson/30 to-transparent" />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[40vh] w-[1px] bg-gradient-to-b from-transparent via-crimson/20 to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">

        <h1
          className="text-6xl font-normal leading-tight tracking-tight text-foreground sm:text-7xl md:text-8xl lg:text-9xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Optima
        </h1>

        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-crimson/50" />
          <p className="text-lg font-light tracking-[0.3em] text-muted-foreground uppercase sm:text-xl">
            EQUIPAMENTOS CNC
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-crimson/50" />
        </div>

        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-crimson/60" />
          <div className="h-1 w-8 rounded-full bg-crimson/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-crimson/60" />
        </div>

        <Link
          to="/login"
          className="mt-10 inline-flex items-center justify-center rounded-md border border-crimson/40 bg-crimson/10 px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-foreground transition-all hover:border-crimson hover:bg-crimson/20"
        >
          Entrar
        </Link>
      </div>

      {/* Corner accents */}
      <div className="pointer-events-none absolute top-6 left-6 h-16 w-16 border-l border-t border-crimson/15" />
      <div className="pointer-events-none absolute top-6 right-6 h-16 w-16 border-r border-t border-crimson/15" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-16 border-l border-b border-crimson/15" />
      <div className="pointer-events-none absolute right-6 bottom-6 h-16 w-16 border-r border-b border-crimson/15" />
    </div>
  );
}
