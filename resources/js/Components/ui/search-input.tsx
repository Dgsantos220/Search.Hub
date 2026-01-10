import { Search, Loader2, X, User, FileText, Phone, Car, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import Turnstile from "react-turnstile";

export type SearchModule = 'cpf' | 'nome' | 'telefone' | 'cnpj' | 'veiculo';

interface SearchInputProps {
  onSearch: (query: string, module: SearchModule, token?: string) => void;
  isLoading?: boolean;
  initialValue?: string;
  initialModule?: SearchModule;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
}

const MODULES: { id: SearchModule; label: string; icon: any; placeholder: string }[] = [
  { id: 'cpf', label: 'CPF', icon: FileText, placeholder: '000.000.000-00' },
  { id: 'nome', label: 'Nome', icon: User, placeholder: 'Nome completo...' },
  { id: 'telefone', label: 'Telefone', icon: Phone, placeholder: '(00) 00000-0000' },
  { id: 'cnpj', label: 'CNPJ', icon: Briefcase, placeholder: '00.000.000/0000-00' },
  { id: 'veiculo', label: 'Veículo', icon: Car, placeholder: 'ABC-1234 ou Placa Mercosul' },
];

export function SearchInput({ onSearch, isLoading, initialValue = "", initialModule = "cpf", className, compact = false, disabled = false }: SearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [selectedModule, setSelectedModule] = useState<SearchModule>(initialModule);
  const [isFocused, setIsFocused] = useState(false);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (initialValue) setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (initialModule) setSelectedModule(initialModule);
  }, [initialModule]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Validações por Módulo
    switch (selectedModule) {
      case 'cpf':
      case 'cnpj':
      case 'telefone':
        // Apenas números
        val = val.replace(/\D/g, '');
        // Limites
        const maxLen = selectedModule === 'cpf' ? 11 : selectedModule === 'cnpj' ? 14 : 11;
        if (val.length > maxLen) val = val.slice(0, maxLen);
        break;

      case 'veiculo':
        // Uppercase e Alfanumérico
        val = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (val.length > 7) val = val.slice(0, 7);
        break;
    }

    setQuery(val);
  };

  const handleModuleChange = (newModule: SearchModule) => {
    if (disabled) return;
    setSelectedModule(newModule);
    setQuery(""); // Limpa busca ao trocar categoria
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (query.trim()) {
      onSearch(query.trim(), selectedModule, token);
    }
  };

  const clearSearch = () => {
    if (disabled) return;
    setQuery("");
  };

  const currentModule = MODULES.find(m => m.id === selectedModule) || MODULES[0];

  if (compact) {
    return (
      <div className={cn("w-full relative", className)}>
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2">
            <select
              value={selectedModule}
              onChange={(e) => handleModuleChange(e.target.value as SearchModule)}
              disabled={disabled}
              className="h-10 px-3 bg-background/80 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50"
            >
              {MODULES.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.label}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={disabled}
                placeholder={`${currentModule.placeholder}`}
                className="w-full h-10 pl-10 pr-8 bg-background/80 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Search className={cn("w-4 h-4 transition-colors", isFocused && "text-primary")} />
                )}
              </div>

              {query && !isLoading && !disabled && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-3xl mx-auto relative z-10", className)}>

      {/* Module Selector - Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {MODULES.map((module) => {
          const Icon = module.icon;
          const isSelected = selectedModule === module.id;
          return (
            <button
              key={module.id}
              onClick={() => handleModuleChange(module.id)}
              type="button"
              disabled={disabled}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected

                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_-5px_hsl(var(--primary))] scale-105"
                  : "bg-background text-muted-foreground border-border/60 hover:border-primary/50 hover:text-primary hover:bg-muted/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {module.label}
            </button>
          );
        })}
      </div>

      <div className="relative group">
        {/* Glow Effect */}
        <div
          className={cn(
            "absolute -inset-1 bg-gradient-to-r from-primary/40 to-blue-600/40 rounded-2xl blur-lg opacity-0 transition-opacity duration-500",
            isFocused ? "opacity-25" : "group-hover:opacity-10"
          )}
        ></div>

        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={`Pesquisar por ${currentModule.label}... Ex: ${currentModule.placeholder}`}
              className="w-full h-16 pl-16 pr-14 bg-secondary/20 hover:bg-secondary/30 focus:bg-background border border-border/50 hover:border-primary/30 rounded-2xl text-lg md:text-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all shadow-lg hover:shadow-xl font-medium tracking-tight"
              autoFocus
            />

            <div className="absolute left-5 text-muted-foreground">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <Search className={cn("w-6 h-6 transition-colors", isFocused ? "text-primary" : "text-muted-foreground/60")} />
              )}
            </div>

            {query && !isLoading && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Helper text */}
      <div className="mt-4 flex justify-center gap-4 text-[10px] md:text-xs text-muted-foreground/70 font-mono font-medium tracking-tight">
        <span>MÓDULO: <span className="text-primary font-bold">{currentModule.label.toUpperCase()}</span></span>
        <span className="opacity-20">|</span>
        <span>PRESSIONE <span className="font-bold">ENTER</span></span>
      </div>

      <div className="mt-4 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
        <Turnstile
          sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
          onVerify={(token) => setToken(token)}
          theme="auto"
        />
      </div>
    </div>
  );
}
