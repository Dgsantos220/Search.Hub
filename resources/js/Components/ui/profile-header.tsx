import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/Components/ui/badge";
import { Skeleton } from "@/Components/ui/skeleton";

interface ProfileHeaderProps {
  data?: any;
  isLoading: boolean;
}

export function ProfileHeader({ data, isLoading }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-card border border-border rounded-2xl p-6 md:p-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Skeleton className="w-24 h-24 rounded-full bg-muted" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-8 w-3/4 bg-muted" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-32 bg-muted" />
              <Skeleton className="h-5 w-20 bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.basic) return null;

  const { basic } = data;

  return (
    <div className="w-full bg-card backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 relative overflow-hidden group shadow-sm">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-10">
        {/* Avatar Placeholder */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-2xl md:text-3xl font-bold text-primary shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          {basic.name.charAt(0)}
        </div>

        <div className="flex-1 space-y-3 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{basic.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground font-mono text-sm">
                <span>CPF: {basic.cpf}</span>
                <button
                  onClick={() => copyToClipboard(basic.cpf)}
                  className="p-1 hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className={cn(
                "px-3 py-1 font-mono uppercase tracking-wider border-border/50",
                basic.status === "REGULAR" ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"
              )}>
                {basic.status}
              </Badge>

              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Score</span>
                <span className={cn(
                  "text-2xl font-bold font-mono",
                  basic.score > 700 ? "text-primary glow-text" : "text-yellow-500"
                )}>
                  {basic.score}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border/50 my-4"></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs block mb-1">DATA NASC.</span>
              <span className="font-mono text-foreground">{basic.birthDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-xs block mb-1">IDADE</span>
              <span className="font-mono text-foreground">{basic.age} ANOS</span>
            </div>
            <div>
              <span className="text-muted-foreground text-xs block mb-1">GÊNERO</span>
              <span className="font-mono text-foreground">{basic.gender}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-xs block mb-1">MÃE</span>
              <span className="font-mono text-foreground truncate max-w-[150px]" title={basic.motherName}>{basic.motherName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
