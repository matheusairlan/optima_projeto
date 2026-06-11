import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSession, logout, type Session } from "@/lib/auth";

export const Route = createFileRoute("/painel")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel — Optima" },
      { name: "description", content: "Painel de codificações Optima" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    setSession(s);
  }, [navigate]);

  if (!session) return null;

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background/95" />

      <div className="pointer-events-none absolute top-6 left-6 h-16 w-16 border-l border-t border-crimson/15" />
      <div className="pointer-events-none absolute top-6 right-6 h-16 w-16 border-r border-t border-crimson/15" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-16 border-l border-b border-crimson/15" />
      <div className="pointer-events-none absolute right-6 bottom-6 h-16 w-16 border-r border-b border-crimson/15" />

      <div className="relative z-10 w-full max-w-md text-center">
        <h1
          className="text-5xl font-normal tracking-tight text-foreground sm:text-6xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Optima
        </h1>
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-crimson/50" />
          <p className="text-xs font-light uppercase tracking-[0.3em] text-muted-foreground">
            {session.role === "admin" ? "Administrador" : "UTILIZADOR"} · {session.username.toUpperCase()}
          </p>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-crimson/50" />
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/codificar" })}
            className="w-full rounded-md border border-crimson/40 bg-crimson/15 px-6 py-4 text-sm font-medium uppercase tracking-[0.25em] text-foreground transition-all hover:border-crimson hover:bg-crimson/30"
          >
            Criar Codificação
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/visualizar" })}
            className="w-full rounded-md border border-crimson/40 bg-crimson/15 px-6 py-4 text-sm font-medium uppercase tracking-[0.25em] text-foreground transition-all hover:border-crimson hover:bg-crimson/30"
          >
            Visualizar Codificações
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md border border-crimson/20 bg-background/40 px-6 py-4 text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground transition-all hover:border-crimson/60 hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
