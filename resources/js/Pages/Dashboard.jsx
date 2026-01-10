import { Head, router, usePage } from "@inertiajs/react";
import { Layout } from "@/Components/layout";
import { SearchInput } from "@/Components/ui/search-input";
import { History, Search, Menu, User, LogOut, Settings, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/use-translation";

export default function DashboardPage() {
  const { auth, system } = usePage().props;
  const [history, setHistory] = useState([]);
  const { t } = useTranslation();

  const isMaintenance = system?.maintenance_mode && !auth?.isAdmin;

  useEffect(() => {
    const saved = localStorage.getItem("search_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.slice(0, 5));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const handleSearch = (query, module, token) => {
    const historyEntry = { query, module };
    const existingHistory = JSON.parse(localStorage.getItem("search_history") || "[]");
    const newHistory = [historyEntry, ...existingHistory.filter(h => h.query !== query || h.module !== module)].slice(0, 5);
    localStorage.setItem("search_history", JSON.stringify(newHistory));

    // Passa o token do Turnstile como parâmetro na URL
    router.visit(`/consulta/${encodeURIComponent(query)}`, {
      data: {
        module,
        token
      }
    });
  };

  const handleHistoryClick = (item) => {
    if (isMaintenance) return;
    if (typeof item === 'object' && item.query && item.module) {
      handleSearch(item.query, item.module);
    } else if (typeof item === 'string') {
      const match = item.match(/^\[([A-Z]+)\]\s*(.+)$/);
      if (match) {
        handleSearch(match[2], match[1].toLowerCase());
      } else {
        handleSearch(item, 'cpf');
      }
    }
  };

  const getHistoryDisplay = (item) => {
    if (typeof item === 'object' && item.query && item.module) {
      return `[${item.module.toUpperCase()}] ${item.query}`;
    }
    return item;
  };

  const handleLogout = () => {
    // Force reset to dark theme upon logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem("search_history"); // Limpar historico de buscas local para evitar vazamento entre contas
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    router.post(route('logout'));
  };

  return (
    <>
      <Head title="Dashboard" />
      <Layout hideNav>
        <div className="absolute top-6 right-6 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="p-3 rounded-full bg-muted border border-border hover:bg-primary/20 hover:border-primary/50 text-foreground transition-all duration-300 shadow-lg group">
                <Menu className="w-6 h-6 group-hover:text-primary" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card/90 backdrop-blur-xl border border-border text-foreground mr-4 mt-2">
              <DropdownMenuLabel className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                {t('dashboard.menu.title')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />

              {auth?.isAdmin && (
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10 focus:text-primary gap-2 text-primary"
                  onClick={() => router.visit("/admin")}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('nav.admin')}</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-primary gap-2"
                onClick={() => router.visit("/settings")}
              >
                <User className="w-4 h-4" />
                <span>{t('nav.profile')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-primary gap-2"
                onClick={() => router.visit("/history")}
              >
                <History className="w-4 h-4" />
                <span>{t('nav.history')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer hover:bg-muted focus:bg-muted focus:text-primary gap-2"
                onClick={() => router.visit("/settings")}
              >
                <Settings className="w-4 h-4" />
                <span>{t('settings.title')}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem
                className="cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 focus:text-red-400 gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="min-h-[85vh] flex flex-col relative">

          <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-4xl space-y-8 animate-in zoom-in-95 duration-700 bg-background p-8 md:p-12 rounded-[2.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-black/50">

              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary tracking-wider uppercase mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {t('dashboard.hero.system')}
                </div>

                <div className="space-y-2">
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground drop-shadow-sm">
                    Search<span className="text-primary">.Hub</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    {t('dashboard.hero.description')}
                  </p>
                </div>
              </div>

              {isMaintenance && (
                <div className="w-full max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4 text-red-500 animate-in fade-in slide-in-from-top-4">
                  <div className="p-2 bg-red-500/20 rounded-lg shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Sistema em Manutenção</h3>
                    <p className="text-sm text-red-400">As consultas estão temporariamente indisponíveis para atualizações programadas.</p>
                  </div>
                </div>
              )}

              <SearchInput onSearch={handleSearch} disabled={isMaintenance} />

              <div className="mt-12 w-full max-w-2xl mx-auto">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-4 uppercase tracking-wider px-1">
                  <div className="flex items-center gap-2">
                    <History className="w-3 h-3" />
                    {t('dashboard.recent.title')}
                  </div>
                </div>

                {history.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {history.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleHistoryClick(item)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group"
                      >
                        <div className="p-2 rounded-lg bg-background shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-foreground/80 font-mono truncate">{getHistoryDisplay(item)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground/40 italic text-center py-8 border border-dashed border-border/50 rounded-xl bg-muted/20">
                    {t('dashboard.recent.empty')}
                  </div>
                )}
              </div>

            </div>
          </main>

          <footer className="py-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 text-[10px] font-mono text-muted-foreground uppercase tracking-widest shadow-sm">
              <ShieldCheck className="w-3 h-3" />
              {t('dashboard.footer.secure')}
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground/60">
              © {new Date().getFullYear()} Search.Hub Intelligence. {t('dashboard.footer.rights')}
            </p>
          </footer>

        </div>
      </Layout>
    </>
  );
}
