// Catálogo do Marvel Rewatch — ordem cronológica definitiva até
// "Avengers: Doomsday" (18 de dezembro de 2026).

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

type MovieDef = { t: string; y: number; r: number };
type SeriesDef = { t: string; y: number; r: number; seasons: string[][] };

function isSeries(d: MovieDef | SeriesDef): d is SeriesDef {
  return "seasons" in d;
}

type Block = { phase: string; entries: (MovieDef | SeriesDef)[] };

const PUNISHER_S1 = [
  "3 AM",
  "Two Dead Men",
  "Kandahar",
  "Resupply",
  "Gunner",
  "The Judas Goat",
  "Crosshairs",
  "Cold Steel",
  "Front Toward Enemy",
  "Virtue of the Vicious",
  "Danger Close",
  "Home",
  "Memento Mori",
];

const PUNISHER_S2 = [
  "Roadhouse Blues",
  "Fight or Flight",
  "Trouble the Water",
  "Scar Tissue",
  "One-Eyed Jacks",
  "Nakazat",
  "One Bad Day",
  "My Brother's Keeper",
  "Flustercluck",
  "The Dark Hearts of Men",
  "The Abyss",
  "Collision Course",
  "The Whirlwind",
];

const BLOCKS: Block[] = [
  {
    phase: "Fase Histórica & Origens",
    entries: [
      { t: "Captain America: The First Avenger", y: 2011, r: 124 },
      { t: "Captain Marvel", y: 2019, r: 123 },
      { t: "Iron Man", y: 2008, r: 126 },
      { t: "The Incredible Hulk", y: 2008, r: 112 },
      { t: "Iron Man 2", y: 2010, r: 124 },
      { t: "Thor", y: 2011, r: 115 },
      { t: "The Avengers", y: 2012, r: 143 },
    ],
  },
  {
    phase: "Pós-Nova York & Era de Ultron",
    entries: [
      { t: "Iron Man 3", y: 2013, r: 130 },
      { t: "Thor: The Dark World", y: 2013, r: 112 },
      { t: "Captain America: The Winter Soldier", y: 2014, r: 136 },
      { t: "Guardians of the Galaxy", y: 2014, r: 121 },
      { t: "Guardians of the Galaxy Vol. 2", y: 2017, r: 136 },
      { t: "Avengers: Age of Ultron", y: 2015, r: 141 },
      { t: "Ant-Man", y: 2015, r: 117 },
    ],
  },
  {
    phase: "Guerra Civil & Justiça das Ruas",
    entries: [
      { t: "Captain America: Civil War", y: 2016, r: 147 },
      { t: "Black Widow", y: 2021, r: 134 },
      { t: "Black Panther", y: 2018, r: 134 },
      { t: "Spider-Man: Homecoming", y: 2017, r: 133 },
      { t: "Doctor Strange", y: 2016, r: 115 },
      { t: "The Punisher", y: 2017, r: 55, seasons: [PUNISHER_S1, PUNISHER_S2] },
      { t: "Thor: Ragnarok", y: 2017, r: 130 },
    ],
  },
  {
    phase: "Guerra Infinita & O Estalo",
    entries: [
      { t: "Ant-Man and the Wasp", y: 2018, r: 118 },
      { t: "Avengers: Infinity War", y: 2018, r: 149 },
      { t: "Avengers: Endgame", y: 2019, r: 181 },
    ],
  },
  {
    phase: "Multiverso & A Saga Principal",
    entries: [
      {
        t: "Loki",
        y: 2021,
        r: 48,
        seasons: [
          [
            "Glorious Purpose",
            "The Variant",
            "Lamentis",
            "The Nexus Event",
            "Journey into Mystery",
            "For All Time. Always.",
          ],
          [
            "Ouroboros",
            "Breaking Brad",
            "1893",
            "Heart of the TVA",
            "Science/Fiction",
            "Glorious Purpose",
          ],
        ],
      },
      {
        t: "WandaVision",
        y: 2021,
        r: 36,
        seasons: [
          [
            "Filmed Before a Live Studio Audience",
            "Don't Touch That Dial",
            "Now in Color",
            "We Interrupt This Program",
            "On a Very Special Episode...",
            "All-New Halloween Spooktacular!",
            "Breaking the Fourth Wall",
            "Previously On",
            "The Series Finale",
          ],
        ],
      },
      { t: "Shang-Chi and the Legend of the Ten Rings", y: 2021, r: 132 },
      {
        t: "The Falcon and the Winter Soldier",
        y: 2021,
        r: 50,
        seasons: [
          [
            "New World Order",
            "The Star-Spangled Man",
            "Power Broker",
            "The Whole World Is Watching",
            "Truth",
            "One World, One People",
          ],
        ],
      },
      { t: "Spider-Man: Far From Home", y: 2019, r: 129 },
      { t: "Eternals", y: 2021, r: 156 },
      { t: "Spider-Man: No Way Home", y: 2021, r: 148 },
      { t: "Doctor Strange in the Multiverse of Madness", y: 2022, r: 126 },
    ],
  },
  {
    phase: "Novos Heróis & Magia",
    entries: [
      {
        t: "Hawkeye",
        y: 2021,
        r: 46,
        seasons: [
          [
            "Never Meet Your Heroes",
            "Hide and Seek",
            "Echoes",
            "Partners, Am I Right?",
            "Ronin",
            "So This Is Christmas?",
          ],
        ],
      },
      {
        t: "Ms. Marvel",
        y: 2022,
        r: 46,
        seasons: [
          ["Generation Why", "Crushed", "Destined", "Seeing Red", "Time and Again", "No Normal"],
        ],
      },
      { t: "Thor: Love and Thunder", y: 2022, r: 119 },
      { t: "Black Panther: Wakanda Forever", y: 2022, r: 161 },
      { t: "Ant-Man and the Wasp: Quantumania", y: 2023, r: 124 },
      { t: "Guardians of the Galaxy Vol. 3", y: 2023, r: 150 },
      { t: "The Marvels", y: 2023, r: 105 },
      {
        t: "Agatha All Along",
        y: 2024,
        r: 40,
        seasons: [
          [
            "Seekest Thou the Road",
            "Circle Sewn with Fate / Unlock Thy Hidden Gate",
            "Through Many Miles / Of Tricks and Trials",
            "If I Can't Reach You / Let My Song Teach You",
            "Darkest Hour / Wake Thy Power",
            "Familiar By Thy Side",
            "Death's Hand in Mine",
            "Follow Me My Friend / To Glory at the End",
            "Maiden Mother Crone",
          ],
        ],
      },
    ],
  },
  {
    phase: "A Reta Final para Doomsday",
    entries: [
      { t: "Deadpool & Wolverine", y: 2024, r: 128 },
      { t: "Captain America: Brave New World", y: 2025, r: 118 },
      {
        t: "Daredevil: Born Again",
        y: 2025,
        r: 48,
        seasons: [
          [
            "Heaven's Half Hour",
            "Optics",
            "The Hollow of His Hand",
            "Sic Semper Systema",
            "With Interest",
            "Excessive Force",
            "Art for Art's Sake",
            "Isle of Joy",
            "Straight to Hell",
          ],
        ],
      },
      { t: "Thunderbolts* (New Avengers)", y: 2025, r: 127 },
      { t: "The Fantastic Four: First Steps", y: 2025, r: 115 },
      { t: "Spider-Man: Brand New Day", y: 2026, r: 120 },
      { t: "Avengers: Doomsday", y: 2026, r: 150 },
    ],
  },
];

export function buildMcuCatalog(): CatalogItem[] {
  const out: CatalogItem[] = [];
  let i = 0;
  for (const block of BLOCKS) {
    for (const d of block.entries) {
      if (isSeries(d)) {
        d.seasons.forEach((eps, sIdx) => {
          eps.forEach((name, eIdx) => {
            out.push({
              kind: "episodio",
              title: `T${sIdx + 1}E${eIdx + 1} · ${name}`,
              series: d.t,
              season: sIdx + 1,
              episode: eIdx + 1,
              year: d.y,
              runtime_min: d.r,
              phase: block.phase,
              order_index: i++,
            });
          });
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
          phase: block.phase,
          order_index: i++,
        });
      }
    }
  }
  return out;
}

export const DOOMSDAY_DATE = "2026-12-18";
