import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Optima" },
      { name: "description", content: "Acesse sua conta Optima" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const session = login(username.trim(), password);
    if (!session) {
      setError("Utilizador ou senha inválidos");
      return;
    }
    navigate({ to: "/painel" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/95" />

      <div className="pointer-events-none absolute top-6 left-6 h-16 w-16 border-l border-t border-crimson/15" />
      <div className="pointer-events-none absolute top-6 right-6 h-16 w-16 border-r border-t border-crimson/15" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-16 border-l border-b border-crimson/15" />
      <div className="pointer-events-none absolute right-6 bottom-6 h-16 w-16 border-r border-b border-crimson/15" />

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md rounded-lg border border-crimson/20 bg-background/60 p-8 backdrop-blur-md sm:p-10"
      >
        <div className="text-center">
          <h1
            className="text-4xl font-normal tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Optima
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-crimson/50" />
            <p className="text-xs font-light uppercase tracking-[0.3em] text-muted-foreground">
              Entrar
            </p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-crimson/50" />
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              UTILIZADOR
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-crimson/20 bg-background/40 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-crimson/60"
              placeholder="seu utilizador"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-crimson/20 bg-background/40 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-crimson/60"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-center text-xs uppercase tracking-[0.2em] text-crimson">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-8 w-full rounded-md border border-crimson/40 bg-crimson/20 px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-foreground transition-all hover:border-crimson hover:bg-crimson/30"
        >
          PRÓXIMO
        </button>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Voltar
          </Link>
        </div>
      </form>
    </div>
  );
}
