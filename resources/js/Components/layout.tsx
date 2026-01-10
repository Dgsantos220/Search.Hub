import { ReactNode, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { LogOut, ShieldCheck, Activity } from "lucide-react";
import { Toaster } from "@/Components/ui/toaster";
import { Toaster as SonnerToaster } from "@/Components/ui/sonner";
import { useTranslation } from "@/hooks/use-translation";

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  const { t } = useTranslation();

  const handleLogout = () => {
    // Force dark mode on logout to ensure Login page (and default state) is dark
    // E limpar dados sensiveis locais
    if (typeof window !== 'undefined') {
      localStorage.removeItem("search_history");
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    router.post("/logout");
  };

  const { auth } = usePage().props as any;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Se usuario estiver logado e tiver preferencia salva, priorizar ela sobre o localStorage
      if (auth?.user?.preferences?.theme) {
        const userTheme = auth.user.preferences.theme;
        if (localStorage.getItem('theme') !== userTheme) {
          localStorage.setItem('theme', userTheme);
        }
      }

      const savedTheme = localStorage.getItem('theme') || 'dark';
      const root = window.document.documentElement;

      // Evitar remover force-dark se estiver login page
      // Mas aqui estamos no Layout principal.

      root.classList.remove('light', 'dark');
      if (savedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(savedTheme);
      }
    }
  }, [auth?.user?.preferences?.theme]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-background via-background to-primary/5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background"></div>
      </div>

      {!hideNav && (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-xl">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/dashboard">
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <span className="font-mono font-bold tracking-tighter text-lg text-foreground">
                  Search<span className="text-primary">.Hub</span>
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/history">
                <button className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <span className="text-xs font-mono">{t('nav.history')}</span>
                </button>
              </Link>
              <Link href="/profile">
                <button className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <span className="text-xs font-mono">{t('nav.profile')}</span>
                </button>
              </Link>
              <Link href="/settings">
                <button className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <span className="text-xs font-mono">{t('nav.config')}</span>
                </button>
              </Link>

              <div className="h-4 w-px bg-border mx-1 hidden md:block"></div>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-mono text-muted-foreground">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span>{t('nav.apiStatus')}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                title={t('nav.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
        {children}
      </main>

      <Toaster />
      <SonnerToaster />
    </div>
  );
}
