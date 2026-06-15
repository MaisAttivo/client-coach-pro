// Catálogo base do álbum Panini FIFA World Cup 26™.
// Estrutura oficial (980 cromos):
//   FWC 1–9       → 9 cromos especiais de abertura (pôster, troféu, mascotes, bola, sedes)
//   FWC 10–20     → 11 lendas / past winners (1930 → 2022)
//   Grupos A–L    → 48 equipas × 20 cromos (escudo + foto equipa + 18 jogadores)
// Total: 9 + 11 + 960 = 980.
//
// Os códigos das equipas (MEX, CAN, USA, …) seguem o padrão FIFA/Panini.
// Os jogadores ficam como "MEX 1 … MEX 18" — editáveis a partir do álbum
// quando a Panini publicar os planteis definitivos.

export type CatalogEntry = {
  number: number;
  section: string;
  team: string | null;
  label: string;
  is_special: boolean;
};

// ---- Especiais de abertura (FWC 1–8) ----
const SPECIALS: { label: string }[] = [
  { label: "FWC 1 — Emblema Oficial" },
  { label: "FWC 2 — Troféu FIFA" },
  { label: "FWC 3 — Mascotes Oficiais (Maple · Zayu · Clutch)" },
  { label: "FWC 4 — Slogan Oficial" },
  { label: "FWC 5 — Bola Oficial (Trionda)" },
  { label: "FWC 6 — Emblema Anfitrião CAN" },
  { label: "FWC 7 — Emblema Anfitrião MEX" },
  { label: "FWC 8 — Emblema Anfitrião USA" },
];

// ---- FIFA World Cup History — Past Winners (FWC 9–19) ----
const LEGENDS: { label: string }[] = [
  { label: "FWC 9 — Itália 1934 (campeã)" },
  { label: "FWC 10 — Uruguai 1950 (campeã)" },
  { label: "FWC 11 — Alemanha FR 1954 (campeã)" },
  { label: "FWC 12 — Brasil 1962 (campeã)" },
  { label: "FWC 13 — Alemanha FR 1974 (campeã)" },
  { label: "FWC 14 — Argentina 1986 (campeã)" },
  { label: "FWC 15 — Brasil 1994 (campeã)" },
  { label: "FWC 16 — França 1998 (campeã)" },
  { label: "FWC 17 — Itália 2006 (campeã)" },
  { label: "FWC 18 — Espanha 2010 (campeã)" },
  { label: "FWC 19 — Argentina 2022 (campeã)" },
];

// ---- Grupos A–L (48 equipas, código + nome PT) ----
// Distribuição por pots/anfitriões; os nomes/equipas podem ser editados no álbum.
type TeamDef = { code: string; name: string };

const GROUPS: Record<string, TeamDef[]> = {
  A: [
    { code: "MEX", name: "México" },
    { code: "RSA", name: "África do Sul" },
    { code: "KOR", name: "Coreia do Sul" },
    { code: "CZE", name: "República Checa" },
  ],
  B: [
    { code: "CAN", name: "Canadá" },
    { code: "BIH", name: "Bósnia e Herzegovina" },
    { code: "QAT", name: "Catar" },
    { code: "SUI", name: "Suíça" },
  ],
  C: [
    { code: "BRA", name: "Brasil" },
    { code: "MAR", name: "Marrocos" },
    { code: "HAI", name: "Haiti" },
    { code: "SCO", name: "Escócia" },
  ],
  D: [
    { code: "USA", name: "Estados Unidos" },
    { code: "PAR", name: "Paraguai" },
    { code: "AUS", name: "Austrália" },
    { code: "TUR", name: "Turquia" },
  ],
  E: [
    { code: "GER", name: "Alemanha" },
    { code: "CUW", name: "Curaçau" },
    { code: "CIV", name: "Costa do Marfim" },
    { code: "ECU", name: "Equador" },
  ],
  F: [
    { code: "NED", name: "Países Baixos" },
    { code: "JPN", name: "Japão" },
    { code: "SWE", name: "Suécia" },
    { code: "TUN", name: "Tunísia" },
  ],
  G: [
    { code: "BEL", name: "Bélgica" },
    { code: "EGY", name: "Egito" },
    { code: "IRN", name: "Irão" },
    { code: "NZL", name: "Nova Zelândia" },
  ],
  H: [
    { code: "ESP", name: "Espanha" },
    { code: "CPV", name: "Cabo Verde" },
    { code: "KSA", name: "Arábia Saudita" },
    { code: "URU", name: "Uruguai" },
  ],
  I: [
    { code: "FRA", name: "França" },
    { code: "SEN", name: "Senegal" },
    { code: "IRQ", name: "Iraque" },
    { code: "NOR", name: "Noruega" },
  ],
  J: [
    { code: "ARG", name: "Argentina" },
    { code: "ALG", name: "Argélia" },
    { code: "AUT", name: "Áustria" },
    { code: "JOR", name: "Jordânia" },
  ],
  K: [
    { code: "POR", name: "Portugal" },
    { code: "COD", name: "RD Congo" },
    { code: "UZB", name: "Usbequistão" },
    { code: "COL", name: "Colômbia" },
  ],
  L: [
    { code: "ENG", name: "Inglaterra" },
    { code: "CRO", name: "Croácia" },
    { code: "GHA", name: "Gana" },
    { code: "PAN", name: "Panamá" },
  ],
};



export const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export function buildDefaultCatalog(): CatalogEntry[] {
  const out: CatalogEntry[] = [];
  let n = 1;

  // FWC 1–9 (especiais de abertura)
  for (const s of SPECIALS) {
    out.push({ number: n++, section: "Especiais", team: null, label: s.label, is_special: true });
  }
  // FWC 10–20 (lendas)
  for (const l of LEGENDS) {
    out.push({ number: n++, section: "Especiais", team: null, label: l.label, is_special: true });
  }

  // Grupos A–L
  for (const g of GROUP_LETTERS) {
    const teams = GROUPS[g];
    for (const t of teams) {
      const sectionName = `Grupo ${g}`;
      const teamName = `${t.code} — ${t.name}`;
      // Ordem oficial por equipa (20 cromos):
      //   1       → Escudo
      //   2–12    → Jogadores 1–11
      //   13      → Foto de equipa
      //   14–20   → Jogadores 12–18
      for (let i = 1; i <= 20; i++) {
        let label: string;
        let is_special = false;
        if (i === 1) {
          label = `${t.code} — Escudo`;
          is_special = true;
        } else if (i === 13) {
          label = `${t.code} — Foto de equipa`;
        } else {
          label = `${t.code} ${i}`;
        }
        out.push({
          number: n++,
          section: sectionName,
          team: teamName,
          label,
          is_special,
        });
      }
    }
  }

  return out;
}

export const SECTIONS_ORDER = [
  "Especiais",
  ...GROUP_LETTERS.map((g) => `Grupo ${g}`),
];
