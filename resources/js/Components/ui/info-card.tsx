import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/Components/ui/skeleton";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface InfoCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

export function InfoCard({ title, icon, children, className, loading }: InfoCardProps) {
  if (loading) {
    return (
      <div className={cn("bg-card border border-border rounded-xl p-5 h-full", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded bg-muted" />
          <Skeleton className="w-32 h-5 bg-muted" />
        </div>
        <div className="space-y-3">
          <Skeleton className="w-full h-12 bg-muted" />
          <Skeleton className="w-full h-12 bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-card backdrop-blur-sm border border-border rounded-xl p-5 hover:border-primary/20 transition-colors h-full flex flex-col shadow-sm hover:shadow-md", className)}>
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex-1 space-y-3">
        {children}
      </div>
    </div>
  );
}

interface DataRowProps {
  label?: string;
  value: string;
  subValue?: string;
  badge?: string;
  copyable?: boolean;
  icon?: ReactNode;
}

export function DataRow({ label, value, subValue, badge, copyable, icon }: DataRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex items-start justify-between p-3 rounded-lg bg-background hover:bg-muted transition-colors border border-border/50 hover:border-border">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="mt-1 text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          {label && <span className="text-[10px] text-muted-foreground uppercase">{label}</span>}
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-foreground truncate">{value}</span>
            {copyable && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
          {subValue && <span className="text-xs text-muted-foreground truncate">{subValue}</span>}
        </div>
      </div>
      {badge && (
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded border font-mono uppercase",
          badge === "ATIVO" || badge === "RESIDENCIAL" || badge === "CELULAR" || badge === "PESSOAL"
            ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/10"
            : "border-border text-muted-foreground"
        )}>
          {badge}
        </span>
      )}
    </div>
  );
}
