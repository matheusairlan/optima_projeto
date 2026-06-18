import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getSession, type Session } from "@/lib/auth";
import {
  listAll,
  updateDescricao,
  formatFullCode,
  FAMILIAS,
  ARTIGOS,
  type Codificacao,
} from "@/lib/codifications";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [filterFamilia, setFilterFamilia] = useState("");
  const [filterArtigo, setFilterArtigo] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [descQuery, setDescQuery] = useState("");
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
    const dq = descQuery.trim().toLowerCase();
    return base
      .filter((c) => {
        if (filterFamilia && c.familia !== filterFamilia) return false;
        if (filterArtigo && c.artigo !== filterArtigo) return false;
        if (filterUser && !c.username.toLowerCase().includes(filterUser.toLowerCase())) return false;
        if (dq && !c.descricao.toLowerCase().includes(dq)) return false;
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [items, filterFamilia, filterArtigo, filterUser, descQuery, session]);

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

  const clearFilters = () => {
    setFilterFamilia("");
    setFilterArtigo("");
    setFilterUser("");
    setDescQuery("");
  };

  const hasFilters = filterFamilia || filterArtigo || filterUser || descQuery;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-8">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background/95" />

      <div className="pointer-events-none absolute top-6 left-6 h-16 w-16 border-l border-t border-crimson/80" />
      <div className="pointer-events-none absolute top-6 right-6 h-16 w-16 border-r border-t border-crimson/80" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-16 border-l border-b border-crimson/80" />
      <div className="pointer-events-none absolute right-6 bottom-6 h-16 w-16 border-r border-b border-crimson/80" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1
            className="text-4xl font-normal tracking-tight text-foreground sm:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Codificações
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-crimson" />
            <p className="text-xs font-light uppercase tracking-[0.3em] text-muted-foreground">
              {session.role === "admin" ? "Vista de Administrador" : "As suas codificações"}
            </p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-crimson" />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            to="/painel"
            className="rounded-md border border-crimson/70 bg-background/40 px-5 py-2.5 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground transition-all hover:border-crimson hover:text-foreground"
          >
            ← Painel
          </Link>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="rounded-md border border-crimson/70 bg-background/40 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-all hover:border-crimson hover:text-foreground"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Barra de Filtros */}
        <div className="mb-3 rounded-lg border border-crimson/70 bg-background/50 p-4 backdrop-blur-md">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-crimson/90">Filtros</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Família</label>
              <select
                value={filterFamilia}
                onChange={(e) => setFilterFamilia(e.target.value)}
                className="w-full rounded-md border border-crimson/60 bg-background/70 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-crimson"
              >
                <option value="">Todas</option>
                {FAMILIAS.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.code} — {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Artigo</label>
              <select
                value={filterArtigo}
                onChange={(e) => setFilterArtigo(e.target.value)}
                className="w-full rounded-md border border-crimson/60 bg-background/70 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-crimson"
              >
                <option value="">Todos</option>
                {ARTIGOS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
            </div>
            {session.role === "admin" && (
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Utilizador</label>
                <input
                  type="text"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  placeholder="ex.: ana"
                  className="w-full rounded-md border border-crimson/60 bg-background/70 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-crimson"
                />
              </div>
            )}
          </div>
        </div>

        {/* Pesquisa por Descrição */}
        <div className="mb-6 rounded-lg border border-crimson/70 bg-background/50 p-4 backdrop-blur-md">
          <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-crimson/90">
            Procurar por descrição
          </label>
          <input
            type="text"
            value={descQuery}
            onChange={(e) => setDescQuery(e.target.value)}
            placeholder="Escreva parte da descrição..."
            className="w-full rounded-md border border-crimson/60 bg-background/70 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-crimson"
          />
        </div>

        {visible.length === 0 ? (
          <div className="rounded-lg border border-crimson/70 bg-background/40 p-12 text-center backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Sem codificações para mostrar
            </p>
            <Link
              to="/codificar"
              className="mt-6 inline-block rounded-md border border-crimson bg-crimson/20 px-6 py-3 text-xs font-medium uppercase tracking-[0.25em] text-foreground transition-all hover:bg-crimson/30"
            >
              Criar primeira codificação
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-crimson/80 bg-background/40 backdrop-blur-md">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-crimson hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Código Completo</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Família</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Artigo</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Série</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Compl.</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Seq.</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Descrição</TableHead>
                  {session.role === "admin" && (
                    <>
                      <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Utilizador</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Data / Hora</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ações</TableHead>
                    </>
                  )}
                  {session.role !== "admin" && (
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Data / Hora</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((c) => (
                  <TableRow key={c.id} className="border-b border-crimson/70 hover:bg-crimson/10">
                    <TableCell className="font-mono text-sm text-foreground">{formatFullCode(c)}</TableCell>
                    <TableCell className="text-sm text-foreground">{c.familia}</TableCell>
                    <TableCell className="text-sm text-foreground">{c.artigo}</TableCell>
                    <TableCell className="text-sm text-foreground">{c.serie}</TableCell>
                    <TableCell className="text-sm text-foreground">{c.complemento}</TableCell>
                    <TableCell className="text-sm font-medium text-foreground">{c.sequencial}</TableCell>
                    <TableCell className="text-sm text-foreground">
                      {editingId === c.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={50}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 rounded-md border border-crimson/70 bg-background/60 px-2 py-1 text-sm text-foreground outline-none focus:border-crimson"
                          />
                          <button
                            onClick={saveEdit}
                            className="rounded-md border border-crimson bg-crimson/30 px-3 text-[10px] uppercase tracking-[0.2em] text-foreground hover:bg-crimson/40"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-md border border-crimson/70 px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        c.descricao || "—"
                      )}
                    </TableCell>
                    {session.role === "admin" && (
                      <>
                        <TableCell className="text-sm text-foreground">{c.username}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleString("pt-PT")}
                        </TableCell>
                        <TableCell>
                          {editingId !== c.id && (
                            <button
                              onClick={() => startEdit(c)}
                              className="rounded-md border border-crimson/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground hover:border-crimson hover:bg-crimson/20"
                            >
                              Editar
                            </button>
                          )}
                        </TableCell>
                      </>
                    )}
                    {session.role !== "admin" && (
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString("pt-PT")}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}


