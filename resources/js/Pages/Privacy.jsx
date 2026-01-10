import { Link, Head } from "@inertiajs/react";
import { ShieldCheck, ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <>
            <Head title="Politica de Privacidade" />
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
                        <h1 className="text-5xl font-bold text-white mb-4">Politica de Privacidade</h1>
                        <p className="text-muted-foreground mb-8 text-lg">Ultima atualizacao: Dezembro de 2024</p>

                        <div className="space-y-12">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">1. Introducao</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    O Bureau.Dados ("Nos", "Nosso" ou "Empresa") esta comprometido em proteger sua privacidade. Esta Politica de Privacidade explica como coletamos, usamos, divulgamos e protegemos seus dados quando voce usa nossa plataforma.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">2. Conformidade com LGPD</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Estamos em conformidade total com a Lei Geral de Protecao de Dados (LGPD) do Brasil. Processamos seus dados pessoais apenas com base em fundamentos legitimos e com seu consentimento quando apropriado.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">3. Coleta de Dados</h2>
                                <div className="text-muted-foreground leading-relaxed space-y-3">
                                    <p>Coletamos as seguintes informacoes:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li><span className="text-white font-semibold">Dados de Conta:</span> Nome, e-mail, senha (criptografada), telefone</li>
                                        <li><span className="text-white font-semibold">Dados de Uso:</span> Historico de buscas, endereco IP, tipo de navegador, timestamps</li>
                                        <li><span className="text-white font-semibold">Dados de Pagamento:</span> Informacoes de cartao (processadas por terceiros seguros)</li>
                                        <li><span className="text-white font-semibold">Dados de Consulta:</span> CPFs, CNPJs e outras informacoes que voce busca (com fins de auditoria e conformidade)</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">4. Uso de Dados</h2>
                                <div className="text-muted-foreground leading-relaxed space-y-3">
                                    <p>Usamos seus dados para:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li>Fornecer, manter e melhorar nosso servico</li>
                                        <li>Processar suas requisicoes e transacoes</li>
                                        <li>Enviar comunicacoes relacionadas a conta e atualizacoes de servico</li>
                                        <li>Cumprir obrigacoes legais e regulatorias</li>
                                        <li>Prevenir fraude e proteger a seguranca da plataforma</li>
                                        <li>Analisar tendencias e entender como os usuarios interagem com nosso servico</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">5. Protecao de Dados</h2>
                                <p className="text-muted-foreground leading-relaxed mb-3">
                                    Implementamos medidas de seguranca rigorosas para proteger seus dados:
                                </p>
                                <div className="text-muted-foreground leading-relaxed space-y-3">
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li>Criptografia de ponta a ponta (TLS/SSL)</li>
                                        <li>Armazenamento criptografado de dados sensiveis</li>
                                        <li>Autenticacao multi-fator (MFA)</li>
                                        <li>Monitoramento continuo de seguranca</li>
                                        <li>Auditorias regulares e testes de penetracao</li>
                                        <li>Acesso restrito aos dados (apenas pessoal autorizado)</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">6. Compartilhamento de Dados</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Nao vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros sem seu consentimento, exceto quando exigido por lei ou para cumprir obrigacoes legais. Nossos parceiros de servico (processadores de pagamento, provedores de hospedagem) estao vinculados por acordos de confidencialidade.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">7. Seus Direitos</h2>
                                <p className="text-muted-foreground leading-relaxed mb-3">
                                    Sob a LGPD, voce tem direito a:
                                </p>
                                <div className="text-muted-foreground leading-relaxed space-y-3">
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li><span className="text-white font-semibold">Acesso:</span> Solicitar copia de seus dados pessoais</li>
                                        <li><span className="text-white font-semibold">Retificacao:</span> Corrigir informacoes imprecisas</li>
                                        <li><span className="text-white font-semibold">Exclusao:</span> Solicitar a exclusao de seus dados ("direito ao esquecimento")</li>
                                        <li><span className="text-white font-semibold">Portabilidade:</span> Receber seus dados em formato portatil</li>
                                        <li><span className="text-white font-semibold">Oposicao:</span> Opor-se ao processamento de seus dados</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">8. Cookies e Rastreamento</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Usamos cookies para melhorar sua experiencia. Voce pode controlar as configuracoes de cookies em seu navegador. Nao rastreamos voce atraves de sites de terceiros.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">9. Retencao de Dados</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Retemos seus dados pessoais pelo tempo necessario para fornecer o servico e cumprir obrigacoes legais. Voce pode solicitar a exclusao de sua conta a qualquer momento.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">10. Alteracoes a Politica</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Podemos atualizar esta Politica de Privacidade periodicamente. Notificaremos voce sobre mudancas significativas via e-mail ou atraves de um aviso em nossa plataforma.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">11. Contato</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Para exercer seus direitos ou questoes sobre privacidade, entre em contato conosco:
                                </p>
                                <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
                                    <p className="text-muted-foreground"><span className="text-white font-semibold">E-mail:</span> privacidade@bureau.dados</p>
                                    <p className="text-muted-foreground"><span className="text-white font-semibold">Telefone:</span> +55 11 9999-9999</p>
                                    <p className="text-muted-foreground"><span className="text-white font-semibold">Encarregado de Dados (DPO):</span> dpo@bureau.dados</p>
                                </div>
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
