import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Badge } from "@/Components/ui/badge";
import { 
    Book, 
    Code, 
    Copy, 
    Server, 
    Shield, 
    Key, 
    Terminal, 
    CheckCircle2, 
    Info,
    ArrowLeft,
    FileDown,
    Activity,
    Lock,
    Globe,
    AlertTriangle,
    Zap
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ApiDocsPage() {
    const baseUrl = window.location.origin;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado para a área de transferência!");
    };

    const downloadPDF = () => {
        window.open(route('admin.api-docs.download'), '_blank');
    };

    const endpointData = [
        {
            title: "Consulta por CPF",
            method: "GET",
            path: "/api/consulta/cpf/{cpf}",
            description: "Retorna todos os dados vinculados a um CPF, incluindo informações pessoais, telefones, endereços e scores.",
            params: [
                { name: "cpf", type: "string", required: true, desc: "CPF apenas números (11 dígitos)." }
            ],
            response: {
                status: 200,
                body: {
                    success: true,
                    data: {
                        dados_pessoais: { nome: "JOAO DA SILVA", cpf: "00000000000", rg: "000000000" },
                        telefones: [{ ddd: "11", telefone: "999999999", tipo: "Móvel" }],
                        score: { csb8: 750, csba: 800 }
                    }
                }
            }
        },
        {
            title: "Consulta por Telefone",
            method: "GET",
            path: "/api/consulta/telefone/{telefone}",
            description: "Localiza o proprietário e todos os dados vinculados a partir de um número de telefone com DDD.",
            params: [
                { name: "telefone", type: "string", required: true, desc: "DDD + Número (apenas números)." }
            ]
        },
        {
            title: "Consulta por Nome",
            method: "GET",
            path: "/api/consulta/nome",
            description: "Realiza busca fonética e aproximada por nome. Retorna lista paginada.",
            params: [
                { name: "nome", type: "string", required: true, desc: "Nome completo ou parcial para pesquisa." },
                { name: "page", type: "int", required: false, desc: "Número da página para paginação." }
            ]
        },
        {
            title: "Consulta por RG",
            method: "GET",
            path: "/api/consulta/rg/{rg}",
            description: "Busca dados cadastrais a partir do número do Registro Geral (RG).",
            params: [
                { name: "rg", type: "string", required: true, desc: "Número do RG (apenas números)." }
            ]
        },
        {
            title: "Consulta por E-mail",
            method: "GET",
            path: "/api/consulta/email/{email}",
            description: "Localiza vínculos e dados cadastrais a partir de um endereço de e-mail.",
            params: [
                { name: "email", type: "string", required: true, desc: "Endereço de e-mail completo." }
            ]
        },
        {
            title: "Consulta Parentes",
            method: "GET",
            path: "/api/consulta/parentes/{cpf}",
            description: "Mapeia a árvore de vínculos familiares e contatos relacionados a um CPF específico.",
            params: [
                { name: "cpf", type: "string", required: true, desc: "CPF do titular consultado." }
            ]
        }
    ];

    const errorCodes = [
        { code: 401, message: "Unauthorized", desc: "Chave de API inválida ou ausente." },
        { code: 403, message: "Forbidden", desc: "Assinatura inativa ou limite de uso atingido." },
        { code: 404, message: "Not Found", desc: "Recurso ou dado não encontrado." },
        { code: 429, message: "Too Many Requests", desc: "Limite de taxa (Rate Limit) excedido." }
    ];

    return (
        <AdminLayout>
            <Head title="Documentação da API | M7 Consultas" />
            <div className="space-y-6 max-w-6xl mx-auto pb-12 px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                            <Zap className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">API Developer Hub</h1>
                            <p className="text-muted-foreground flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                v1.0.0 • Documentação Técnica Oficial
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.visit(route('admin.api-keys.index'))} className="gap-2 border-white/10 hover:bg-white/5">
                            <Key className="w-4 h-4" />
                            Gerenciar Chaves
                        </Button>
                        <Button onClick={downloadPDF} className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                            <FileDown className="w-4 h-4" />
                            Exportar PDF Profissional
                        </Button>
                    </div>
                </div>

                <div id="api-docs-content" className="space-y-8 bg-slate-950/50 p-6 rounded-3xl border border-white/5">
                    {/* PDF Header (Hidden in Web) */}
                    <div className="hidden pdf-only flex items-center justify-between border-b border-white/10 pb-8 mb-8">
                        <div className="flex items-center gap-4">
                            <Shield className="w-12 h-12 text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-white">M7 CONSULTAS</h1>
                                <p className="text-sm text-primary tracking-widest uppercase font-semibold">Technical Documentation</p>
                            </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                            <p>Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
                            <p>Confidencial • Uso Interno</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-primary" />
                                    Autenticação
                                </h2>
                                <Card className="bg-slate-900/50 border-white/10 overflow-hidden">
                                    <CardContent className="p-6 space-y-4">
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            Todas as requisições devem incluir sua chave de API no cabeçalho <code className="text-primary bg-primary/10 px-1 rounded">Authorization</code> como um token Bearer.
                                        </p>
                                        <div className="relative group">
                                            <pre className="p-4 bg-black/60 rounded-xl border border-white/10 font-mono text-sm text-emerald-400 overflow-x-auto">
                                                Authorization: Bearer YOUR_API_KEY
                                            </pre>
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => copyToClipboard("Authorization: Bearer YOUR_API_KEY")}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs">
                                            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                                            <p>Nunca exponha sua chave de API em código client-side (frontend). Utilize sempre um backend seguro para realizar as chamadas.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-primary" />
                                    Endpoints de Consulta
                                </h2>
                                <div className="space-y-4">
                                    {endpointData.map((endpoint, idx) => (
                                        <Card key={idx} className="bg-slate-900/50 border-white/10 hover:border-primary/30 transition-colors group">
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Badge className="bg-primary/20 text-primary border-primary/30">{endpoint.method}</Badge>
                                                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">{endpoint.title}</h3>
                                                    </div>
                                                    <code className="text-[10px] bg-black/40 px-2 py-1 rounded border border-white/5 text-slate-400">{endpoint.path}</code>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 space-y-4">
                                                <p className="text-xs text-slate-400">{endpoint.description}</p>
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parâmetros</h4>
                                                    {endpoint.params.map((p, i) => (
                                                        <div key={i} className="flex items-center justify-between text-[11px] p-2 bg-black/20 rounded-lg border border-white/5">
                                                            <span className="font-mono text-primary">{p.name} <span className="text-slate-600">({p.type})</span></span>
                                                            <span className="text-slate-400">{p.desc}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Status & Erros
                                </h2>
                                <Card className="bg-slate-900/50 border-white/10">
                                    <CardContent className="p-4 space-y-3">
                                        {errorCodes.map((err, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                <Badge variant="outline" className="w-10 justify-center border-white/10 text-slate-400">{err.code}</Badge>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{err.message}</p>
                                                    <p className="text-[10px] text-slate-500">{err.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Code className="w-5 h-5 text-primary" />
                                    Exemplo Rápido
                                </h2>
                                <Tabs defaultValue="curl" className="w-full">
                                    <TabsList className="w-full bg-black/40 border border-white/10 p-1">
                                        <TabsTrigger value="curl" className="flex-1 text-xs">cURL</TabsTrigger>
                                        <TabsTrigger value="js" className="flex-1 text-xs">Node.js</TabsTrigger>
                                        <TabsTrigger value="php" className="flex-1 text-xs">PHP</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="curl">
                                        <pre className="p-4 bg-black/60 rounded-xl border border-white/10 font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed">
                                            {`curl -X GET "${baseUrl}/api/v1/consulta/cpf/000..." \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Accept: application/json"`}
                                        </pre>
                                    </TabsContent>
                                    <TabsContent value="js">
                                        <pre className="p-4 bg-black/60 rounded-xl border border-white/10 font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed">
                                            {`const res = await fetch("${baseUrl}/api/v1/...", {
  headers: { 'Authorization': 'Bearer KEY' }
});
const data = await res.json();`}
                                        </pre>
                                    </TabsContent>
                                    <TabsContent value="php">
                                        <pre className="p-4 bg-black/60 rounded-xl border border-white/10 font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed">
                                            {`$response = Http::withToken('KEY')
  ->get('${baseUrl}/api/v1/...');`}
                                        </pre>
                                    </TabsContent>
                                </Tabs>
                            </section>

                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-6 text-center space-y-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                                        <Info className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-white">Precisa de ajuda?</h3>
                                    <p className="text-xs text-slate-400">Nossa equipe técnica está disponível para auxiliar na sua integração.</p>
                                    <Button variant="link" className="text-primary text-xs">suporte@m7consultas.com</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* PDF Footer */}
                    <div className="hidden pdf-only border-t border-white/10 pt-8 mt-8 text-center">
                        <p className="text-[10px] text-slate-500">© {new Date().getFullYear()} M7 Consultas - Todos os direitos reservados. O uso desta API está sujeito aos termos de serviço.</p>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .pdf-only { display: flex !important; }
                    #admin-sidebar, #admin-header, button:not(.pdf-only) { display: none !important; }
                }
                .pdf-only { display: none; }
            `}} />
        </AdminLayout>
    );
}
