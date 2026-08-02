// Catálogo base do Marvel Rewatch — tudo o que faz sentido ver antes de
// "Avengers: Doomsday" (18 de dezembro de 2026).
// Ordem: cronologia de estreia (MCU Saga do Multiverso incluída).

export type CatalogItem = {
  kind: "filme" | "episodio";
  title: string;
  series: string | null;
  season: number | null;
  episode: number | null;
  year: number;
  runtime_min: number;
  phase: string;
  order_index: number;
};

type MovieDef = { t: string; y: number; r: number; p: string };
type SeriesDef = {
  t: string;
  y: number;
  eps: number[]; // episódios por temporada
  r: number; // duração média por episódio
  p: string;
};

// Sequência combinada, por ordem de estreia.
const TIMELINE: (MovieDef | SeriesDef)[] = [
  { t: "Iron Man", y: 2008, r: 126, p: "Fase 1" },
  { t: "O Incrível Hulk", y: 2008, r: 112, p: "Fase 1" },
  { t: "Iron Man 2", y: 2010, r: 124, p: "Fase 1" },
  { t: "Thor", y: 2011, r: 115, p: "Fase 1" },
  { t: "Capitão América: O Primeiro Vingador", y: 2011, r: 124, p: "Fase 1" },
  { t: "Os Vingadores", y: 2012, r: 143, p: "Fase 1" },
  { t: "Iron Man 3", y: 2013, r: 130, p: "Fase 2" },
  { t: "Thor: O Mundo das Trevas", y: 2013, r: 112, p: "Fase 2" },
  { t: "Capitão América: O Soldado do Inverno", y: 2014, r: 136, p: "Fase 2" },
  { t: "Guardiões da Galáxia", y: 2014, r: 121, p: "Fase 2" },
  { t: "Vingadores: A Era de Ultron", y: 2015, r: 141, p: "Fase 2" },
  { t: "Homem-Formiga", y: 2015, r: 117, p: "Fase 2" },
  { t: "Capitão América: Guerra Civil", y: 2016, r: 147, p: "Fase 3" },
  { t: "Doutor Estranho", y: 2016, r: 115, p: "Fase 3" },
  { t: "Guardiões da Galáxia Vol. 2", y: 2017, r: 136, p: "Fase 3" },
  { t: "Homem-Aranha: Regresso a Casa", y: 2017, r: 133, p: "Fase 3" },
  { t: "Thor: Ragnarok", y: 2017, r: 130, p: "Fase 3" },
  { t: "Pantera Negra", y: 2018, r: 134, p: "Fase 3" },
  { t: "Vingadores: Guerra do Infinito", y: 2018, r: 149, p: "Fase 3" },
  { t: "Homem-Formiga e a Vespa", y: 2018, r: 118, p: "Fase 3" },
  { t: "Capitã Marvel", y: 2019, r: 123, p: "Fase 3" },
  { t: "Vingadores: Endgame", y: 2019, r: 181, p: "Fase 3" },
  { t: "Homem-Aranha: Longe de Casa", y: 2019, r: 129, p: "Fase 3" },
  { t: "WandaVision", y: 2021, eps: [9], r: 36, p: "Fase 4" },
  { t: "Falcão e o Soldado do Inverno", y: 2021, eps: [6], r: 50, p: "Fase 4" },
  { t: "Loki", y: 2021, eps: [6, 6], r: 48, p: "Fase 4" },
  { t: "Viúva Negra", y: 2021, r: 134, p: "Fase 4" },
  { t: "What If...?", y: 2021, eps: [9, 9, 8], r: 32, p: "Fase 4" },
  { t: "Shang-Chi e a Lenda dos Dez Anéis", y: 2021, r: 132, p: "Fase 4" },
  { t: "Eternals", y: 2021, r: 156, p: "Fase 4" },
  { t: "Hawkeye", y: 2021, eps: [6], r: 46, p: "Fase 4" },
  { t: "Homem-Aranha: Sem Volta a Casa", y: 2021, r: 148, p: "Fase 4" },
  { t: "Cavaleiro da Lua", y: 2022, eps: [6], r: 47, p: "Fase 4" },
  { t: "Doutor Estranho no Multiverso da Loucura", y: 2022, r: 126, p: "Fase 4" },
  { t: "Ms. Marvel", y: 2022, eps: [6], r: 46, p: "Fase 4" },
  { t: "Thor: Amor e Trovão", y: 2022, r: 119, p: "Fase 4" },
  { t: "She-Hulk: Advogada", y: 2022, eps: [9], r: 34, p: "Fase 4" },
  { t: "Werewolf by Night (especial)", y: 2022, r: 52, p: "Fase 4" },
  { t: "Pantera Negra: Wakanda Para Sempre", y: 2022, r: 161, p: "Fase 4" },
  { t: "Guardiões da Galáxia: Especial de Natal", y: 2022, r: 44, p: "Fase 4" },
  { t: "Homem-Formiga e a Vespa: Quantumania", y: 2023, r: 124, p: "Fase 5" },
  { t: "Guardiões da Galáxia Vol. 3", y: 2023, r: 150, p: "Fase 5" },
  { t: "Invasão Secreta", y: 2023, eps: [6], r: 48, p: "Fase 5" },
  { t: "The Marvels", y: 2023, r: 105, p: "Fase 5" },
  { t: "Echo", y: 2024, eps: [5], r: 42, p: "Fase 5" },
  { t: "Deadpool & Wolverine", y: 2024, r: 128, p: "Fase 5" },
  { t: "Agatha All Along", y: 2024, eps: [9], r: 40, p: "Fase 5" },
  { t: "Capitão América: Admirável Mundo Novo", y: 2025, r: 118, p: "Fase 5" },
  { t: "Daredevil: Born Again", y: 2025, eps: [9], r: 48, p: "Fase 5" },
  { t: "Thunderbolts*", y: 2025, r: 127, p: "Fase 5" },
  { t: "Ironheart", y: 2025, eps: [6], r: 44, p: "Fase 5" },
  { t: "Os Quatro Fantásticos: Primeiros Passos", y: 2025, r: 115, p: "Fase 6" },
  { t: "Wonder Man", y: 2026, eps: [8], r: 35, p: "Fase 6" },
  { t: "Homem-Aranha: Brand New Day", y: 2026, r: 120, p: "Fase 6" },
];

function isSeries(d: MovieDef | SeriesDef): d is SeriesDef {
  return "eps" in d;
}

export function buildMcuCatalog(): CatalogItem[] {
  const out: CatalogItem[] = [];
  let i = 0;
  for (const d of TIMELINE) {
    if (isSeries(d)) {
      d.eps.forEach((count, sIdx) => {
        for (let e = 1; e <= count; e++) {
          out.push({
            kind: "episodio",
            title: `T${sIdx + 1}E${e}`,
            series: d.t,
            season: sIdx + 1,
            episode: e,
            year: d.y,
            runtime_min: d.r,
            phase: d.p,
            order_index: i++,
          });
        }
      });
    } else {
      out.push({
        kind: "filme",
        title: d.t,
        series: null,
        season: null,
        episode: null,
        year: d.y,
        runtime_min: d.r,
        phase: d.p,
        order_index: i++,
      });
    }
  }
  return out;
}

export const DOOMSDAY_DATE = "2026-12-18";
