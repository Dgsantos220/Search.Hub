import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Key,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Package,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTokenSync } from "@/hooks/useTokenSync";
import { Toaster } from "@/Components/ui/sonner";

export default function AdminLayout({ children }) {
  const { url } = usePage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useTokenSync();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Usuários", href: "/admin/users" },
    { icon: Package, label: "Planos", href: "/admin/plans" },
    { icon: CreditCard, label: "Assinaturas", href: "/admin/subscriptions" },
    { icon: Wallet, label: "Gateways", href: "/admin/gateways" },
    { icon: Key, label: "Sistema", href: "/admin/system" },
    { icon: ShieldCheck, label: "Gerenciar API", href: "/admin/api-keys" },
    { icon: Search, label: "Área de Busca", href: "/dashboard", highlight: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex overflow-hidden">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card/80 backdrop-blur-xl border-r border-border transition-all duration-300 ease-in-out lg:static",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-64"
        )}
      >
        <div className="h-full flex flex-col">
          <div className={cn(
            "h-16 flex items-center border-b border-border transition-all duration-300",
            collapsed ? "px-0 justify-center" : "px-6"
          )}>
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
                {!collapsed && (
                  <span className="font-mono font-bold text-lg text-foreground animate-in fade-in duration-300">
                    ADMIN<span className="text-primary">.PANEL</span>
                  </span>
                )}
              </div>
            </Link>
            <button
              className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === '/admin'
                ? url === '/admin'
                : url === item.href || url.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all group relative",
                      collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={cn("w-4 h-4 flex-shrink-0", collapsed && "w-5 h-5", item.highlight && "text-primary")} />
                    {!collapsed && (
                      <span className="truncate animate-in fade-in duration-300">{item.label}</span>
                    )}
                    {collapsed && (
                      <div className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex justify-end p-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <div className={cn(
            "p-4 border-t border-border",
            collapsed && "items-center flex flex-col"
          )}>
            <div className={cn(
              "flex items-center gap-3 rounded-lg bg-muted/50 border border-border mb-2 overflow-hidden transition-all",
              collapsed ? "p-1.5 w-10 h-10 justify-center" : "px-3 py-3"
            )}>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0 text-xs">
                AD
              </div>
              {!collapsed && (
                <div className="flex-1 overflow-hidden animate-in fade-in duration-300">
                  <p className="text-sm font-medium text-foreground truncate">Administrador</p>
                  <p className="text-xs text-muted-foreground truncate">admin@bureau.dados</p>
                </div>
              )}
            </div>
            <Link
              href="/logout"
              method="post"
              as="button"
              className={cn(
                "flex items-center gap-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors",
                collapsed ? "justify-center w-10 h-10 p-0" : "w-full px-3 py-2"
              )}
              title={collapsed ? "Sair" : undefined}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="animate-in fade-in duration-300">Sair</span>}
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden h-16 flex items-center px-4 border-b border-border bg-background/50 backdrop-blur-sm">
          <button
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-bold text-foreground">Painel Administrativo</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>

        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}
