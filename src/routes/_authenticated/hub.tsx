import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Dices, Dumbbell, Home, LogOut, Plus, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/hub")({
  head: () => ({
    meta: [
      { title: "Hub — JP HUB" },
      { name: "description", content: "Todas as tuas apps num só sítio: PT, finanças, imobiliário e jogos." },
      { property: "og:title", content: "Hub — JP HUB" },
      { property: "og:description", content: "Todas as tuas apps num só sítio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HubPage,
});

type AppItem = {
  id: string;
  name: string;
  description: string;
  to?: string;
  icon: typeof Dumbbell;
};

const APPS: AppItem[] = [
  {
    id: "pt",
    name: "PT Manager",
    description: "Gestão de clientes, treinos e pagamentos.",
    to: "/pt",
    icon: Dumbbell,
  },
  {
    id: "financas",
    name: "Finanças",
    description: "Receitas, despesas fixas e variáveis.",
    to: "/financas",
    icon: Wallet,
  },
  {
    id: "imobiliario",
    name: "Imobiliário",
    description: "Anúncios dos portais filtrados em tempo real.",
    to: "/imobiliario",
    icon: Home,
  },
  {
    id: "jogos",
    name: "Jogos e entretenimento",
    description: "Scoreboards, álbum de cromos e Marvel Rewatch.",
    to: "/jogos",
    icon: Dices,
  },
];

function userDisplayName(user: ReturnType<typeof useAuth>["user"]): string {
  if (!user) return "";
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (meta && typeof meta.full_name === "string") return meta.full_name;
  const parts: string[] = [];
  if (meta && typeof meta.given_name === "string") parts.push(meta.given_name);
  if (meta && typeof meta.family_name === "string") parts.push(meta.family_name);
  if (parts.length) return parts.join(" ");
  return user.email?.split("@")[0] ?? "";
}

function HubPage() {
  const { user, signOut } = useAuth();
  const displayName = userDisplayName(user);

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-2xl mx-auto px-5 pt-8 pb-4 flex items-end justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3 h-3" /> Tarefas
          </Link>
          <h1 className="font-display text-3xl leading-none mt-2 font-semibold tracking-tight">
            {displayName || "Bem-vindo"}
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          aria-label="Sair"
          className="rounded-full hover:bg-surface"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 mt-6">
          As tuas apps
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {APPS.map((app) => {
            const Icon = app.icon;
            return (
              <Link key={app.id} to={app.to!} className="block">
                <div className="group relative h-full bg-surface border border-border rounded-2xl p-5 transition-all hover:border-primary/40 active:scale-[0.99]">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.18em] text-primary/70">
                      App
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-semibold mt-5 tracking-tight">
                    {app.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {app.description}
                  </p>
                </div>
              </Link>
            );
          })}

          <div className="h-full bg-surface/40 border border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[170px]">
            <div className="w-11 h-11 rounded-xl bg-background border border-border flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Mais apps em breve</p>
          </div>
        </div>
      </main>
    </div>
  );
}
