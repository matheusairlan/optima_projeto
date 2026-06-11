// Dados, tipos e armazenamento das codificações Optima.

export type Familia = {
  code: string;
  name: string;
};

export const FAMILIAS: Familia[] = [
  { code: "OP", name: "OPTIMAS" },
  { code: "MO", name: "MAXIOPTIMAS" },
  { code: "FL", name: "FLEXIOPTIMAS" },
  { code: "LO", name: "LASER OPTIMA" },
  { code: "LI", name: "LASER IMPORTADOS" },
  { code: "PO", name: "PRENSAS" },
  { code: "SS", name: "MÁQUINAS DE SERRA" },
  { code: "GP", name: "GUINCHOS E PONTES" },
  { code: "ST", name: "NORMALIZADOS" },
  { code: "FR", name: "FERRAMENTAS" },
  { code: "SE", name: "TAPETES" },
  { code: "SV", name: "SERVIÇOS" },
];

export type Artigo = {
  code: string; // dígito 0-9
  name: string;
};

export const ARTIGOS: Artigo[] = [
  { code: "0", name: "PRODUTO ACABADO" },
  { code: "1", name: "CONJUNTO" },
  { code: "2", name: "PEÇA" },
  { code: "3", name: "ESQUEMA ELÉCTRICO" },
  { code: "4", name: "ESQUEMA PNEUMÁTICO" },
  { code: "5", name: "ESQUEMA HIDRÁULICO" },
  { code: "6", name: "LIVRE" },
  { code: "7", name: "DESENHO LAY-OUT" },
  { code: "8", name: "DOCUMENTO" },
  { code: "9", name: "CONJUNTO FANTASMA" },
];

export const POSICOES = ["00", "0D", "0E"] as const;

export const PAISES: { code: string; name: string }[] = [
  { code: "PT", name: "Portugal" },
  { code: "ES", name: "Espanha" },
  { code: "FR", name: "França" },
  { code: "DE", name: "Alemanha" },
  { code: "IT", name: "Itália" },
  { code: "GB", name: "Reino Unido" },
  { code: "NL", name: "Países Baixos" },
  { code: "BE", name: "Bélgica" },
  { code: "CH", name: "Suíça" },
  { code: "SE", name: "Suécia" },
];

// Séries por família+artigo. Algumas combinações explícitas, restantes derivadas
// deterministicamente a partir da combinação.
const SERIES_MAP: Record<string, string[]> = {
  OP1: ["2333", "2444", "2345"],
  FL7: ["2456", "2341", "1234"],
  OP0: ["1100", "1101", "1102"],
  MO1: ["3300", "3301", "3302"],
  LO2: ["4400", "4401", "4402"],
};

function hashCombo(combo: string): number {
  let h = 0;
  for (let i = 0; i < combo.length; i++) h = (h * 31 + combo.charCodeAt(i)) >>> 0;
  return h;
}

export function getSeriesFor(familia: string, artigo: string): string[] {
  const key = `${familia}${artigo}`;
  if (SERIES_MAP[key]) return SERIES_MAP[key];
  const base = 1000 + (hashCombo(key) % 8000);
  return [String(base), String(base + 111), String(base + 222)];
}

export function complementoForcado(artigo: string): "posicao" | "pais" | null {
  if (artigo === "3" || artigo === "4" || artigo === "5") return "posicao";
  if (artigo === "8") return "pais";
  return null;
}

// ---------------- Armazenamento ----------------

const STORAGE_KEY = "optima_codifs";
const SEQ_KEY = "optima_seq";

export type Codificacao = {
  id: string;
  sequencial: string; // 4 dígitos
  familia: string;
  artigo: string;
  serie: string;
  complemento: string;
  complementoTipo: "posicao" | "pais";
  descricao: string;
  username: string;
  createdAt: number;
};

export function listAll(): Codificacao[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Codificacao[]) : [];
  } catch {
    return [];
  }
}

function persist(list: Codificacao[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function nextSequencial(): string {
  const cur = Number(localStorage.getItem(SEQ_KEY) || "0") + 1;
  localStorage.setItem(SEQ_KEY, String(cur));
  return String(cur).padStart(4, "0");
}

export function saveCodificacao(
  input: Omit<Codificacao, "id" | "sequencial" | "createdAt">,
): Codificacao {
  const list = listAll();
  const cod: Codificacao = {
    ...input,
    id: crypto.randomUUID(),
    sequencial: nextSequencial(),
    createdAt: Date.now(),
  };
  list.push(cod);
  persist(list);
  return cod;
}

export function updateDescricao(id: string, descricao: string) {
  const list = listAll();
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], descricao };
    persist(list);
  }
}

export function formatFullCode(c: Codificacao): string {
  return `${c.familia}${c.artigo}-${c.serie}-${c.complemento}-${c.sequencial}`;
}
