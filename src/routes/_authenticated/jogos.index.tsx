import { createFileRoute, Link } from "@tanstack/react-router";
import { Dices, Plus, StickyNote } from "lucide-react";

export const Route = createFileRoute("/_authenticated/jogos/")({
  component: JogosIndex,
});

type Game = {
  id: string;
  name: string;
  description: string;
  to?: string;
  available: boolean;
  icon?: typeof Dices;
};

const GAMES: Game[] = [
  {
    id: "quickstop",
    name: "Quick Stop",
    description: "Scoreboard: cartas na mão, rondas ganhas e vencedor.",
    to: "/jogos/quickstop",
    available: true,
    icon: Dices,
  },
  {
    id: "album-wc26",
    name: "Álbum World Cup 26",
    description: "Gestor de cromos: completion %, faltas, repetidos e filtros.",
    to: "/jogos/album",
    available: true,
    icon: StickyNote,
  },
];

function JogosIndex() {
  return (
    <main className="px-5 pb-16">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 mt-2">
        Os teus jogos
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <Link
            key={g.id}
            to={g.to!}
            className="group relative h-full bg-surface border border-border rounded-2xl p-5 transition-all hover:border-primary/40 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Dices className="w-5 h-5" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.18em] text-primary/70">
                Jogo
              </span>
            </div>
            <h2 className="font-display text-lg font-semibold mt-5 tracking-tight">
              {g.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {g.description}
            </p>
          </Link>
        ))}

        <div className="h-full bg-surface/40 border border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[170px]">
          <div className="w-11 h-11 rounded-xl bg-background border border-border flex items-center justify-center mb-3">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">Mais jogos em breve</p>
        </div>
      </div>
    </main>
  );
}
