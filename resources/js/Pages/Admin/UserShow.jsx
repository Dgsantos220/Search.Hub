import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Switch } from "@/Components/ui/switch";
import {
  ChevronLeft,
  Edit,
  Ban,
  UserCheck,
  CreditCard,
  RefreshCw,
  XCircle,
  RotateCcw,
  Calendar,
  Activity,
  History,
  Loader2
} from "lucide-react";
import { router, Link } from "@inertiajs/react";
import { toast } from "sonner";

export default function UserShow({ user, subscriptions = [], usage, auditLogs = [], plans = [] }) {
  const [changePlanDialog, setChangePlanDialog] = useState({ open: false, plan_id: '', immediate: true });
  const [adjustPeriodDialog, setAdjustPeriodDialog] = useState({ open: false, date: '' });
  const [processing, setProcessing] = useState(false);

  const handleBlock = () => {
    router.post(`/admin/users/${user.id}/block`, {}, {
      onSuccess: () => toast.success('Usuario bloqueado'),
      onError: () => toast.error('Erro ao bloquear'),
    });
  };

  const handleUnblock = () => {
    router.post(`/admin/users/${user.id}/unblock`, {}, {
      onSuccess: () => toast.success('Usuario desbloqueado'),
      onError: () => toast.error('Erro ao desbloquear'),
    });
  };

  const handleCancelSubscription = (atPeriodEnd = true) => {
    if (!confirm(atPeriodEnd
      ? 'Cancelar assinatura ao final do periodo?'
      : 'Cancelar assinatura imediatamente?')) return;

    router.post(`/admin/users/${user.id}/cancel-subscription`, { at_period_end: atPeriodEnd }, {
      onSuccess: () => toast.success('Assinatura cancelada'),
      onError: () => toast.error('Erro ao cancelar'),
    });
  };

  const handleReactivateSubscription = () => {
    router.post(`/admin/users/${user.id}/reactivate-subscription`, {}, {
      onSuccess: () => toast.success('Assinatura reativada'),
      onError: () => toast.error('Erro ao reativar'),
    });
  };

  const handleResetUsage = () => {
    if (!confirm('Resetar o consumo deste usuario? Esta acao nao pode ser desfeita.')) return;

    router.post(`/admin/users/${user.id}/reset-usage`, {}, {
      onSuccess: () => toast.success('Consumo resetado'),
      onError: () => toast.error('Erro ao resetar'),
    });
  };

  const handleAdjustPeriod = () => {
    setProcessing(true);
    router.post(`/admin/users/${user.id}/adjust-period`, { current_period_end: adjustPeriodDialog.date }, {
      onSuccess: () => {
        toast.success('Periodo ajustado');
        setAdjustPeriodDialog({ open: false, date: '' });
      },
      onError: () => toast.error('Erro ao ajustar periodo'),
      onFinish: () => setProcessing(false),
    });
  };

  const handleChangePlan = () => {
    if (!changePlanDialog.plan_id) {
      toast.error('Selecione um plano');
      return;
    }

    setProcessing(true);
    router.post(route('admin.users.change-plan', user.id), {
      plan_id: changePlanDialog.plan_id,
      immediate: changePlanDialog.immediate,
      generate_payment: changePlanDialog.generate_payment
    }, {
      onSuccess: () => {
        toast.success('Plano alterado com sucesso');
        setChangePlanDialog({ open: false, plan_id: '', immediate: true, generate_payment: true });
      },
      onError: (err) => {
        toast.error(err.error || 'Erro ao alterar plano');
      },
      onFinish: () => setProcessing(false)
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { label: 'Ativo', className: 'bg-green-500/20 text-green-500' },
      blocked: { label: 'Bloqueado', className: 'bg-red-500/20 text-red-500' },
    };
    const c = config[status] || config.active;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getSubscriptionStatusBadge = (status) => {
    const config = {
      active: { label: 'Ativo', className: 'bg-green-500/20 text-green-500' },
      trialing: { label: 'Em teste', className: 'bg-blue-500/20 text-blue-500' },
      canceled: { label: 'Cancelado', className: 'bg-red-500/20 text-red-500' },
      expired: { label: 'Expirado', className: 'bg-gray-500/20 text-gray-500' },
      past_due: { label: 'Pagamento pendente', className: 'bg-yellow-500/20 text-yellow-500' },
    };
    const c = config[status] || config.active;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const activeSubscription = subscriptions.find(s => ['active', 'trialing'].includes(s.status));

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            {getStatusBadge(user.status)}
          </div>

          <div className="flex gap-2">
            <Link href={`/admin/users/${user.id}/edit`}>
              <Button variant="outline" className="border-border">
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
            </Link>
            {user.status === 'active' ? (
              <Button variant="outline" className="border-red-500/30 text-red-500" onClick={handleBlock}>
                <Ban className="w-4 h-4 mr-2" /> Bloquear
              </Button>
            ) : (
              <Button variant="outline" className="border-green-500/30 text-green-500" onClick={handleUnblock}>
                <UserCheck className="w-4 h-4 mr-2" /> Desbloquear
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="info">Informacoes</TabsTrigger>
            <TabsTrigger value="subscription">Assinatura</TabsTrigger>
            <TabsTrigger value="history">Historico</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nome</Label>
                      <p className="text-foreground">{user.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="text-foreground">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Telefone</Label>
                      <p className="text-foreground">{user.phone || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Cadastro</Label>
                      <p className="text-foreground">{user.created_at}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Funcoes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.roles?.map((role) => (
                      <Badge key={role.id} variant="outline" className="border-primary/50 text-primary bg-primary/10">
                        {role.name}
                      </Badge>
                    ))}
                    {(!user.roles || user.roles.length === 0) && (
                      <p className="text-muted-foreground">Nenhuma funcao atribuida</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {usage && (
                <Card className="bg-card border-border md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground">Consumo do Periodo</CardTitle>
                      <CardDescription>Periodo: {usage.period_key}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="border-border" onClick={handleResetUsage}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Resetar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Consultas</span>
                          <span className="text-sm text-foreground">
                            {usage.consultas_used} / {usage.consultas_limit === -1 ? 'Ilimitado' : usage.consultas_limit}
                          </span>
                        </div>
                        {usage.consultas_limit !== -1 && (
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${Math.min((usage.consultas_used / usage.consultas_limit) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="subscription">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Assinaturas</CardTitle>
                  <CardDescription>Historico de assinaturas do usuario</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setChangePlanDialog({ open: true, plan_id: activeSubscription?.plan_id || '', immediate: true })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {activeSubscription ? 'Alterar Plano' : 'Assinar Plano'}
                  </Button>

                  {activeSubscription && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border"
                        onClick={() => setAdjustPeriodDialog({ open: true, date: '' })}
                      >
                        <Calendar className="w-4 h-4 mr-2" /> Ajustar Periodo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-500"
                        onClick={() => handleCancelSubscription(true)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Cancelar
                      </Button>
                    </>
                  )}
                  {!activeSubscription && subscriptions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500/30 text-green-500"
                      onClick={handleReactivateSubscription}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Reativar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma assinatura encontrada</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Plano</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Inicio</TableHead>
                        <TableHead className="text-muted-foreground">Fim do Periodo</TableHead>
                        <TableHead className="text-muted-foreground">Cancelado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((sub) => (
                        <TableRow key={sub.id} className="border-border">
                          <TableCell className="text-foreground">{sub.plan_name}</TableCell>
                          <TableCell>{getSubscriptionStatusBadge(sub.status)}</TableCell>
                          <TableCell className="text-muted-foreground">{sub.started_at}</TableCell>
                          <TableCell className="text-muted-foreground">{sub.current_period_end}</TableCell>
                          <TableCell className="text-muted-foreground">{sub.canceled_at || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Historico de Acoes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Historico de consultas e acoes do usuario
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Log de Auditoria</CardTitle>
                <CardDescription>Ultimas alteracoes realizadas neste usuario</CardDescription>
              </CardHeader>
              <CardContent>
                {auditLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum registro de auditoria</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Acao</TableHead>
                        <TableHead className="text-muted-foreground">Realizado por</TableHead>
                        <TableHead className="text-muted-foreground">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id} className="border-border">
                          <TableCell className="text-foreground">{log.action}</TableCell>
                          <TableCell className="text-muted-foreground">{log.actor_name}</TableCell>
                          <TableCell className="text-muted-foreground">{log.created_at}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={changePlanDialog.open} onOpenChange={(open) => setChangePlanDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Alterar Plano de Assinatura</DialogTitle>
            <DialogDescription>
              Selecione o novo plano para o usuario.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Novo Plano</Label>
              <Select
                value={String(changePlanDialog.plan_id)}
                onValueChange={(v) => setChangePlanDialog(prev => ({ ...prev, plan_id: v }))}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price / 100)}/{p.interval === 'monthly' ? 'mês' : 'ano'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="immediate"
                checked={changePlanDialog.immediate}
                onCheckedChange={(checked) => setChangePlanDialog(prev => ({ ...prev, immediate: checked }))}
              />
              <Label htmlFor="immediate">Aplicar imediatamente (novo ciclo começa hoje)</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="generate_payment"
                checked={changePlanDialog.generate_payment}
                onCheckedChange={(checked) => setChangePlanDialog(prev => ({ ...prev, generate_payment: checked }))}
              />
              <Label htmlFor="generate_payment">Gerar pagamento confirmado (Contabilizar Receita)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanDialog({ ...changePlanDialog, open: false })} className="border-border">
              Cancelar
            </Button>
            <Button onClick={handleChangePlan} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Alteração'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={adjustPeriodDialog.open} onOpenChange={(open) => setAdjustPeriodDialog({ open, date: '' })}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Ajustar Periodo da Assinatura</DialogTitle>
            <DialogDescription>Defina uma nova data de fim do periodo</DialogDescription>
          </DialogHeader>
          <Input
            type="date"
            value={adjustPeriodDialog.date}
            onChange={(e) => setAdjustPeriodDialog({ ...adjustPeriodDialog, date: e.target.value })}
            className="bg-background border-border"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustPeriodDialog({ open: false, date: '' })} className="border-border">
              Cancelar
            </Button>
            <Button onClick={handleAdjustPeriod} disabled={!adjustPeriodDialog.date || processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
