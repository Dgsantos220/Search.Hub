import { Link, Head } from "@inertiajs/react";
import { ShieldCheck, ChevronLeft } from "lucide-react";

export default function TermsPage() {
    return (
        <>
            <Head title="Termos e Condicoes" />
            <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
                </div>

                <nav className="relative z-50 w-full border-b border-white/5 bg-background/20 backdrop-blur-sm">
                    <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                        <Link href="/">
                            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                </div>
                                <span className="font-mono font-bold tracking-tighter text-xl text-white">
                                    BUREAU<span className="text-primary">.DADOS</span>
                                </span>
                            </div>
                        </Link>
                        <Link href="/">
                            <button className="flex items-center gap-2 text-sm font-medium text-white hover:text-primary transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                                Voltar
                            </button>
                        </Link>
                    </div>
                </nav>

                <main className="relative z-10 container mx-auto px-6 py-20 max-w-4xl">
                    <div className="animate-in slide-in-from-bottom-10 fade-in duration-700">
                        <h1 className="text-5xl font-bold text-white mb-4">Termos e Condicoes</h1>
                        <p className="text-muted-foreground mb-8 text-lg">Ultima atualizacao: Dezembro de 2024</p>

                        <div className="space-y-12">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">1. Aceitacao dos Termos</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Ao acessar e usar a plataforma Bureau.Dados, voce concorda em cumprir e estar vinculado por estes Termos e Condicoes. Se voce nao concorda com qualquer parte destes termos, nao use o servico.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">2. Descricao do Servico</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    O Bureau.Dados e uma plataforma de inteligencia de dados que fornece informacoes cadastrais de CPF e CNPJ, bem como dados de contato, enderecos e informacoes relacionadas. O servico e fornecido "como esta" e para fins legais unicamente.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">3. Responsabilidades do Usuario</h2>
                                <div className="text-muted-foreground leading-relaxed space-y-3">
                                    <p>Voce concorda em:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li>Usar o servico apenas para fins legais e em conformidade com todas as leis aplicaveis</li>
                                        <li>Manter as credenciais de sua conta confidenciais e seguras</li>
                                        <li>Informar imediatamente sobre qualquer acesso nao autorizado</li>
                                        <li>Respeitar os direitos de privacidade e confidencialidade de terceiros</li>
                                        <li>Nao utilizar dados para fins discriminatorios, ilicitos ou prejudiciais</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">4. Uso Aceitavel</h2>
                                <p className="text-muted-foreground leading-relaxed mb-3">Voce se compromete a nao:</p>
                                <div className="text-muted-foreground leading-relaxed space-y-3">
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li>Compartilhar dados obtidos atraves da plataforma com terceiros nao autorizados</li>
                                        <li>Usar o servico para fins de stalking, assedio ou fraude</li>
                                        <li>Tentar acessar, hackear ou contornar sistemas de seguranca</li>
                                        <li>Extrair dados em massa ou automaticamente sem autorizacao</li>
                                        <li>Vender, redistribuir ou comercializar dados obtidos</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">5. Limitacao de Responsabilidade</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    O Bureau.Dados nao se responsabiliza por perdas, danos ou consequencias resultantes do uso ou incapacidade de usar o servico. Nao garantimos que as informacoes sejam sempre precisas, completas ou atualizadas.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">6. Modificacoes do Servico</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Reservamos o direito de modificar, suspender ou descontinuar o servico ou qualquer parte dele a qualquer momento, com ou sem aviso previo.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">7. Rescisao</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Podemos encerrar sua conta ou acesso ao servico imediatamente, sem aviso previo, se determinarmos que voce violou estes Termos e Condicoes ou a Lei.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">8. Lei Aplicavel</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Estes Termos e Condicoes sao regidos pelas leis da Republica Federativa do Brasil, sem consideracao a conflitos de leis.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">9. Contato</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Para duvidas sobre estes Termos e Condicoes, entre em contato conosco atraves do formulario de contato na plataforma ou envie um e-mail para: <span className="text-primary">contato@bureau.dados</span>
                                </p>
                            </section>
                        </div>

                        <div className="mt-16 pt-8 border-t border-white/10">
                            <Link href="/">
                                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
                                    <ChevronLeft className="w-4 h-4" />
                                    Voltar a Pagina Inicial
                                </button>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
