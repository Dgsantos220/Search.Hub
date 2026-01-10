import { Link, Head } from "@inertiajs/react";
import { ShieldCheck, AlertCircle, Home } from "lucide-react";

export default function NotFoundPage() {
    return (
        <>
            <Head title="Pagina Nao Encontrada" />
            <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center relative overflow-hidden">
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-br from-background via-background to-primary/10"></div>
                    <div className="absolute inset-0 bg-background/90"></div>
                </div>

                <div className="relative z-10 text-center px-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-8">
                        <AlertCircle className="w-16 h-16 text-red-400" />
                    </div>
                    
                    <h1 className="text-8xl font-bold text-white mb-4 font-mono">404</h1>
                    <p className="text-2xl text-muted-foreground mb-2">PAGINA NAO ENCONTRADA</p>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        O recurso que voce esta tentando acessar nao existe ou foi movido para outro endereco.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_-5px_rgba(0,240,255,0.6)] flex items-center justify-center gap-2">
                                <Home className="w-5 h-5" />
                                Voltar ao Inicio
                            </button>
                        </Link>
                        <Link href="/login">
                            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold transition-colors flex items-center justify-center gap-2">
                                <ShieldCheck className="w-5 h-5" />
                                Fazer Login
                            </button>
                        </Link>
                    </div>

                    <div className="mt-16 text-xs text-muted-foreground font-mono opacity-50">
                        ERRO 404 | BUREAU.DADOS
                    </div>
                </div>
            </div>
        </>
    );
}
