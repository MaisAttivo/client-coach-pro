import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/jogos")({
  head: () => ({ meta: [{ title: "Jogos" }] }),
  component: JogosLayout,
});

function JogosLayout() {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen pb-12 bg-background">
      <header className="max-w-2xl mx-auto px-5 pt-8 pb-4 flex items-end justify-between gap-3">
        <div className="flex items-end gap-3 min-w-0">
          <Link
            to="/"
            aria-label="Voltar ao hub"
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-surface shrink-0 mb-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.32em] text-primary font-medium">
              JP HUB · Jogos
            </p>
            <h1 className="font-display text-3xl leading-none mt-1.5 font-semibold tracking-tight truncate">
              Game <span className="text-primary italic font-light">night</span>
            </h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          aria-label="Sair"
          className="rounded-full hover:bg-surface shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </header>
      <div className="max-w-2xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
