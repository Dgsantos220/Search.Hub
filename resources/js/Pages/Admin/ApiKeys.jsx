import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { ShieldCheck, Plus, Trash2, Power, PowerOff, Copy, Clock, User, Eye, EyeOff, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ApiKeysPage({ apiKeys = [], newKey = null }) {
    const [name, setName] = useState("");
    const [processing, setProcessing] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = (e) => {
        e.preventDefault();
        if (!name) return;
        setProcessing(true);
        router.post(route('admin.api-keys.store'), { name }, {
            onSuccess: () => {
                toast.success("Chave API gerada com sucesso!");
                setName("");
            },
            onFinish: () => setProcessing(false)
        });
    };

    const handleToggle = (id) => {
        router.post(route('admin.api-keys.toggle', id));
    };

    const handleDelete = (id) => {
        if (confirm("Tem certeza que deseja excluir esta chave?")) {
            router.delete(route('admin.api-keys.destroy', id));
        }
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Chave copiada para a área de transferência!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AdminLayout>
            <Head title="Gerenciar API" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        Gerenciar API
                    </h1>
                    <Button variant="outline" onClick={() => router.visit(route('admin.api-docs'))} className="gap-2 border-border">
                        <Clock className="w-4 h-4" />
                        Documentação da API
                    </Button>
                </div>

                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-lg">Gerar Nova Chave</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleGenerate} className="flex gap-4">
                            <Input
                                placeholder="Nome da Chave (ex: App Mobile, Integração CRM)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="max-w-md"
                            />
                            <Button type="submit" disabled={processing} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Gerar Chave
                            </Button>
                        </form>

                        {newKey && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Chave Gerada com Sucesso!
                                    </h4>
                                    <Badge className="bg-emerald-500 text-white">Copie agora</Badge>
                                </div>
                                <p className="text-xs text-emerald-200/70">Por segurança, esta chave será exibida apenas esta vez. Guarde-a em um local seguro.</p>
                                <div className="flex items-center gap-2 font-mono text-sm bg-muted p-3 rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                                    <span className="flex-1 break-all">
                                        {showKey ? newKey : "•".repeat(40)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="hover:bg-emerald-500/20 h-8 w-8"
                                            onClick={() => setShowKey(!showKey)}
                                            title={showKey ? "Ocultar" : "Mostrar"}
                                        >
                                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className={cn(
                                                "h-8 w-8 transition-all duration-300",
                                                copied ? "bg-emerald-500 text-white hover:bg-emerald-600" : "hover:bg-emerald-500/20"
                                            )}
                                            onClick={() => copyToClipboard(newKey)}
                                            title="Copiar"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border">
                                    <TableHead className="text-muted-foreground">Nome</TableHead>
                                    <TableHead className="text-muted-foreground">Chave</TableHead>
                                    <TableHead className="text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-muted-foreground">Último Uso</TableHead>
                                    <TableHead className="text-muted-foreground">Criado por</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {apiKeys.map((apiKey) => (
                                    <TableRow key={apiKey.id} className="border-border hover:bg-muted/50">
                                        <TableCell className="font-medium text-foreground">{apiKey.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-mono text-[10px] bg-muted p-2 rounded border border-border text-muted-foreground">
                                                <span className="truncate max-w-[150px]">{apiKey.key.substring(0, 16)}...</span>
                                                <Badge variant="outline" className="text-[8px] h-4 border-border">Hashed</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {apiKey.active ? (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Ativa</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Bloqueada</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleString() : 'Nunca usada'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3" />
                                                {apiKey.user?.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleToggle(apiKey.id)}
                                                    className={apiKey.active ? "text-yellow-400" : "text-emerald-400"}
                                                    title={apiKey.active ? "Bloquear" : "Ativar"}
                                                >
                                                    {apiKey.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(apiKey.id)}
                                                    className="text-red-400 hover:text-red-300"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {apiKeys.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhuma chave API encontrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
