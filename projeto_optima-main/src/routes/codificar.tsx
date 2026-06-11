import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getSession, type Session } from "@/lib/auth";
import {
  FAMILIAS,
  ARTIGOS,
  POSICOES,
  PAISES,
  getSeriesFor,
  complementoForcado,
  saveCodificacao,
} from "@/lib/codifications";

export const Route = createFileRoute("/codificar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Criar Codificação — Optima" },
      { name: "description", content: "Criar nova codificação Optima" },
    ],
  }),
  component: Codificar,
});

type Step = "familia" | "artigo" | "serie" | "complemento" | "descricao" | "resultado";

function Codificar() {
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

  const [step, setStep] = useState<Step>("familia");
  const [familia, setFamilia] = useState("");
  const [artigo, setArtigo] = useState("");
  const [serie, setSerie] = useState("");
  const [complementoTipo, setComplementoTipo] = useState<"posicao" | "pais" | "">("");
  const [complemento, setComplemento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [savedSequencial, setSavedSequencial] = useState("");
  const [savedId, setSavedId] = useState("");

  const series = useMemo(
    () => (familia && artigo ? getSeriesFor(familia, artigo) : []),
    [familia, artigo],
  );

  // Aplica exceções de complemento automaticamente.
  useEffect(() => {
    if (step !== "complemento") return;
    const forced = complementoForcado(artigo);
    if (forced === "posicao") {
      setComplementoTipo("posicao");
      setComplemento("00");
    } else if (forced === "pais") {
      setComplementoTipo("pais");
      if (POSICOES.includes(complemento as (typeof POSICOES)[number])) setComplemento("");
    }
  }, [step, artigo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null;

  const handleSave = () => {
    if (!session) return;
    const cod = saveCodificacao({
      familia,
      artigo,
      serie,
      complemento,
      complementoTipo: (complementoTipo || "posicao") as "posicao" | "pais",
      descricao: descricao.trim(),
      username: session.username,
    });
    setSavedSequencial(cod.sequencial);
    setSavedId(cod.id);
    setStep("resultado");
  };

  const resetAll = () => {
    setFamilia("");
    setArtigo("");
    setSerie("");
    setComplementoTipo("");
    setComplemento("");
    setDescricao("");
    setSavedSequencial("");
    setSavedId("");
    setStep("familia");
  };

  return (
    <Shell>
      {/* Breadcrumb das escolhas anteriores */}
      <Breadcrumb
        step={step}
        familia={familia}
        artigo={artigo}
        serie={serie}
        complemento={complemento}
      />

      {step === "familia" && (
        <StepCard title="Escolher Família">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FAMILIAS.map((f) => (
              <OptionButton
                key={f.code}
                active={familia === f.code}
                onClick={() => {
                  setFamilia(f.code);
                  setStep("artigo");
                }}
              >
                <span className="font-medium">{f.code}</span>
                <span className="ml-2 text-xs text-muted-foreground">{f.name}</span>
              </OptionButton>
            ))}
          </div>
          <FooterActions backTo="/painel" />
        </StepCard>
      )}

      {step === "artigo" && (
        <StepCard title="Escolher Tipo de Artigo">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ARTIGOS.map((a) => (
              <OptionButton
                key={a.code}
                active={artigo === a.code}
                onClick={() => {
                  setArtigo(a.code);
                  setStep("serie");
                }}
              >
                <span className="font-medium">{a.code}</span>
                <span className="ml-2 text-xs text-muted-foreground">{a.name}</span>
              </OptionButton>
            ))}
          </div>
          <FooterActions onBack={() => setStep("familia")} />
        </StepCard>
      )}

      {step === "serie" && (
        <StepCard title="Escolher Nº de Série">
          <div className="grid grid-cols-1 gap-2">
            {series.map((s) => (
              <OptionButton
                key={s}
                active={serie === s}
                onClick={() => {
                  setSerie(s);
                  setStep("complemento");
                }}
              >
                <span className="font-medium tracking-widest">{s}</span>
              </OptionButton>
            ))}
          </div>
          <FooterActions onBack={() => setStep("artigo")} />
        </StepCard>
      )}

      {step === "complemento" && (
        <StepCard title="Escolher Complemento">
          {(() => {
            const forced = complementoForcado(artigo);
            const showPosicao = forced === null || forced === "posicao";
            const showPais = forced === null || forced === "pais";
            return (
              <div className="space-y-6">
                {forced && (
                  <p className="text-xs uppercase tracking-[0.2em] text-crimson">
                    {forced === "posicao"
                      ? "Este artigo exige complemento de POSIÇÃO 00"
                      : "Este artigo exige complemento de PAÍS"}
                  </p>
                )}

                {showPosicao && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Por posição
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {POSICOES.map((p) => {
                        const disabled = forced === "posicao" && p !== "00";
                        return (
                          <OptionButton
                            key={p}
                            disabled={disabled}
                            active={complementoTipo === "posicao" && complemento === p}
                            onClick={() => {
                              setComplementoTipo("posicao");
                              setComplemento(p);
                            }}
                          >
                            <span className="font-medium">{p}</span>
                          </OptionButton>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showPais && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Por país
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {PAISES.map((p) => (
                        <OptionButton
                          key={p.code}
                          active={complementoTipo === "pais" && complemento === p.code}
                          onClick={() => {
                            setComplementoTipo("pais");
                            setComplemento(p.code);
                          }}
                        >
                          <span className="font-medium">{p.code}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{p.name}</span>
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                )}

                <FooterActions
                  onBack={() => setStep("serie")}
                  onNext={complemento ? () => setStep("descricao") : undefined}
                  nextLabel="Próximo"
                />
              </div>
            );
          })()}
        </StepCard>
      )}

      {step === "descricao" && (
        <StepCard title="Descrição">
          {/* Quadros em horizontal */}
          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <InfoBox label="Família+Artigo" value={`${familia}${artigo}`} />
            <InfoBox label="Nº de Série" value={serie} />
            <InfoBox label="Complemento" value={complemento} />
            <InfoBox label="Nº Sequencial" value="próximo" subtle />
          </div>

          <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Descrição (máx. 50 caracteres)
          </label>
          <input
            type="text"
            maxLength={50}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição da codificação"
            className="w-full rounded-md border border-crimson/20 bg-background/40 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-crimson/60"
          />
          <p className="mt-1 text-right text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {descricao.length}/50
          </p>

          <FooterActions
            onBack={() => setStep("complemento")}
            onNext={descricao.trim() ? handleSave : undefined}
            nextLabel="Guardar"
          />
        </StepCard>
      )}

      {step === "resultado" && (
        <StepCard title="Codificação Guardada">
          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <InfoBox label="Família+Artigo" value={`${familia}${artigo}`} />
            <InfoBox label="Nº de Série" value={serie} />
            <InfoBox label="Complemento" value={complemento} />
            <InfoBox label="Nº Sequencial" value={savedSequencial} />
          </div>
          <div className="rounded-md border border-crimson/20 bg-background/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Descrição
            </p>
            <p className="mt-1 text-sm text-foreground">{descricao}</p>
          </div>

          <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Código gerado: {`${familia}${artigo}-${serie}-${complemento}-${savedSequencial}`}
          </p>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => navigate({ to: "/painel" })}
              className="rounded-md border border-crimson/20 bg-background/40 px-6 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-all hover:border-crimson/60 hover:text-foreground"
            >
              ← Painel
            </button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={resetAll}
                className="rounded-md border border-crimson/20 bg-background/40 px-6 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-all hover:border-crimson/60 hover:text-foreground"
              >
                Nova codificação
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/visualizar" })}
                className="rounded-md border border-crimson/40 bg-crimson/20 px-6 py-3 text-xs font-medium uppercase tracking-[0.25em] text-foreground transition-all hover:border-crimson hover:bg-crimson/30"
              >
                Próximo →
              </button>
            </div>
          </div>

          <p className="sr-only">{savedId}</p>
        </StepCard>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background/95" />
      <div className="pointer-events-none absolute top-6 left-6 h-16 w-16 border-l border-t border-crimson/15" />
      <div className="pointer-events-none absolute top-6 right-6 h-16 w-16 border-r border-t border-crimson/15" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-16 border-l border-b border-crimson/15" />
      <div className="pointer-events-none absolute right-6 bottom-6 h-16 w-16 border-r border-b border-crimson/15" />
      <div className="relative z-10 w-full max-w-2xl">{children}</div>
    </div>
  );
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-crimson/20 bg-background/60 p-6 backdrop-blur-md sm:p-8">
      <div className="mb-6 text-center">
        <h1
          className="text-3xl font-normal tracking-tight text-foreground sm:text-4xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h1>
        <div className="mt-2 flex items-center justify-center gap-3">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-crimson/50" />
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-muted-foreground">
            Optima
          </p>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-crimson/50" />
        </div>
      </div>
      {children}
    </div>
  );
}

function Breadcrumb({
  step,
  familia,
  artigo,
  serie,
  complemento,
}: {
  step: Step;
  familia: string;
  artigo: string;
  serie: string;
  complemento: string;
}) {
  const items: { label: string; value: string }[] = [];
  if (step !== "familia" && familia) {
    if (step === "artigo") items.push({ label: "Família", value: familia });
    else items.push({ label: "Família+Artigo", value: `${familia}${artigo}` });
  }
  if (["complemento", "descricao", "resultado"].includes(step) && serie)
    items.push({ label: "Nº Série", value: serie });
  if (["descricao", "resultado"].includes(step) && complemento)
    items.push({ label: "Complemento", value: complemento });

  if (items.length === 0) return null;
  return (
    <div className="mb-4 flex flex-wrap justify-center gap-2">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-md border border-crimson/20 bg-background/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          {it.label}: <span className="text-foreground">{it.value}</span>
        </div>
      ))}
    </div>
  );
}

function OptionButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-md border px-4 py-3 text-left text-sm uppercase tracking-[0.15em] transition-all",
        active
          ? "border-crimson bg-crimson/30 text-foreground"
          : "border-crimson/30 bg-background/30 text-foreground hover:border-crimson/70 hover:bg-crimson/15",
        disabled ? "cursor-not-allowed opacity-40 hover:border-crimson/30 hover:bg-background/30" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function InfoBox({
  label,
  value,
  subtle,
}: {
  label: string;
  value: string;
  subtle?: boolean;
}) {
  return (
    <div className="rounded-md border border-crimson/20 bg-background/40 px-3 py-2 text-center">
      <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p
        className={[
          "mt-1 text-sm font-medium tracking-wider",
          subtle ? "text-muted-foreground" : "text-foreground",
        ].join(" ")}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function FooterActions({
  onBack,
  backTo,
  onNext,
  nextLabel,
}: {
  onBack?: () => void;
  backTo?: string;
  onNext?: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-2">
      {backTo ? (
        <Link
          to={backTo}
          className="rounded-md border border-crimson/20 bg-background/40 px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-all hover:border-crimson/60 hover:text-foreground"
        >
          ← Voltar
        </Link>
      ) : onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-crimson/20 bg-background/40 px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-all hover:border-crimson/60 hover:text-foreground"
        >
          ← Voltar
        </button>
      ) : (
        <span />
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="rounded-md border border-crimson/40 bg-crimson/20 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.25em] text-foreground transition-all hover:border-crimson hover:bg-crimson/30"
        >
          {nextLabel || "Próximo"}
        </button>
      )}
    </div>
  );
}
