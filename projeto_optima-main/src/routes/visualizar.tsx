import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getSession, type Session } from "@/lib/auth";
import {
  listAll,
  updateDescricao,
  formatFullCode,
  type Codificacao,
} from "@/lib/codifications";

export const Route = createFileRoute("/visualizar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Visualizar Codificações — Optima" },
      { name: "description", content: "Consulta de codificações Optima" },
    ],
  }),
  component: Visualizar,
});

function Visualizar() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Codificacao[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    setSession(s);
    setItems(listAll());
  }, [navigate]);

  const visible = useMemo(() => {
    if (!session) return [];
    const base = session.role === "admin" ? items : items.filter((i) => i.username === session.username);
    const q = query.trim().toLowerCase();
    if (!q) return [...base].sort((a, b) => b.createdAt - a.createdAt);
    return base
      .filter((c) => {
        const fa = `${c.familia}${c.artigo}`.toLowerCase();
        return (
          c.familia.toLowerCase().includes(q) ||
          c.artigo.toLowerCase().includes(q) ||
          fa.includes(q) ||
          c.serie.toLowerCase().includes(q) ||
          c.complemento.toLowerCase().includes(q) ||
          c.sequencial.includes(q) ||
          c.descricao.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [items, query, session]);

  if (!session) return null;

  const startEdit = (c: Codificacao) => {
    setEditingId(c.id);
    setEditValue(c.descricao);
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateDescricao(editingId, editValue.slice(0, 50));
    setItems(listAll());
    setEditingId(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-8">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background/95" />

      <div className="pointer-events-none absolute top-6 left-6 h-16 w-16 border-l border-t border-crimson/15" />
      <div className="pointer-events-none absolute top-6 right-6 h-16 w-16 border-r border-t border-crimson/15" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-16 border-l border-b border-crimson/15" />
      <div className="pointer-events-none absolute right-6 bottom-6 h-16 w-16 border-r border-b border-crimson/15" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1
            className="text-4xl font-normal tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Codificações
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-crimson/50" />
            <p className="text-xs font-light uppercase tracking-[0.3em] text-muted-foreground">
              {session.role === "admin" ? "Vista de Administrador" : "As suas codificações"}
            </p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-crimson/50" />
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/painel"
            className="rounded-md border border-crimson/20 bg-background/40 px-5 py-2.5 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground transition-all hover:border-crimson/60 hover:text-foreground"
          >
            ← Painel
          </Link>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar família, artigo, série, complemento, sequencial..."
            className="w-full rounded-md border border-crimson/20 bg-background/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-crimson/60 sm:max-w-md"
          />
        </div>

        {visible.length === 0 ? (
          <div className="rounded-lg border border-crimson/20 bg-background/40 p-12 text-center backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Sem codificações para mostrar
            </p>
            <Link
              to="/codificar"
              className="mt-6 inline-block rounded-md border border-crimson/40 bg-crimson/20 px-6 py-3 text-xs font-medium uppercase tracking-[0.25em] text-foreground transition-all hover:border-crimson hover:bg-crimson/30"
            >
              Criar primeira codificação
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visible.map((c) => (
              <article
                key={c.id}
                className="group rounded-lg border border-crimson/20 bg-background/50 p-5 backdrop-blur-md transition-all hover:border-crimson/50"
              >
                <div className="grid grid-cols-4 gap-2">
                  <Cell label="Fam+Art" value={`${c.familia}${c.artigo}`} />
                  <Cell label="Série" value={c.serie} />
                  <Cell label="Compl." value={c.complemento} />
                  <Cell label="Seq." value={c.sequencial} highlight />
                </div>

                <div className="mt-3 rounded-md border border-crimson/15 bg-background/40 p-3">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                    Descrição
                  </p>
                  {editingId === c.id ? (
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        maxLength={50}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 rounded-md border border-crimson/30 bg-background/60 px-2 py-1 text-sm text-foreground outline-none focus:border-crimson"
                      />
                      <button
                        onClick={saveEdit}
                        className="rounded-md border border-crimson/50 bg-crimson/30 px-3 text-[10px] uppercase tracking-[0.2em] text-foreground hover:bg-crimson/40"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-md border border-crimson/20 px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-foreground">{c.descricao || "—"}</p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="font-mono text-foreground/80">{formatFullCode(c)}</span>
                  <div className="flex items-center gap-3">
                    {session.role === "admin" && (
                      <>
                        <span>Utilizador: <span className="text-foreground">{c.username}</span></span>
                        <span>{new Date(c.createdAt).toLocaleString("pt-PT")}</span>
                        {editingId !== c.id && (
                          <button
                            onClick={() => startEdit(c)}
                            className="rounded-md border border-crimson/30 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground hover:border-crimson hover:bg-crimson/20"
                          >
                            Editar
                          </button>
                        )}
                      </>
                    )}
                    {session.role !== "admin" && (
                      <span>{new Date(c.createdAt).toLocaleString("pt-PT")}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-md border px-2 py-1.5 text-center",
        highlight
          ? "border-crimson/50 bg-crimson/15"
          : "border-crimson/20 bg-background/40",
      ].join(" ")}
    >
      <p className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium tracking-wider text-foreground">{value}</p>
    </div>
  );
}
