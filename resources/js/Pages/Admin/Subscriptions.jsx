import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Search,
  MoreHorizontal,
  XCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  Ban,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

const statusConfig = {
  active: { label: "Ativo", variant: "default", icon: CheckCircle, color: "text-green-500" },
  trialing: { label: "Em teste", variant: "secondary", icon: Clock, color: "text-blue-500" },
  past_due: { label: "Pagamento pendente", variant: "warning", icon: AlertTriangle, color: "text-yellow-500" },
  canceled: { label: "Cancelado", variant: "destructive", icon: XCircle, color: "text-red-500" },
  expired: { label: "Expirado", variant: "outline", icon: Ban, color: "text-gray-500" },
};

const paymentStatusConfig = {
  pending: { label: "Pendente", variant: "secondary", color: "text-yellow-500" },
  paid: { label: "Pago", variant: "default", color: "text-green-500" },
  failed: { label: "Falhou", variant: "destructive", color: "text-red-500" },
  refunded: { label: "Reembolsado", variant: "outline", color: "text-gray-500" },
};

export default function AdminSubscriptions({ subscriptions, payments, stats = {}, plans = [], filters = {} }) {
  const [search, setSearch] = useState(filters.search || "");
  const [rejectDialog, setRejectDialog] = useState({ open: false, payment: null });
  const [rejectReason, setRejectReason] = useState("");

  const handleFilter = (key, value) => {
    router.get('/admin/subscriptions', {
      ...filters,
      [key]: value === 'all' ? undefined : value || undefined
    }, { preserveState: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilter('search', search);
  };

  const handleCancelSubscription = (subscription) => {
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) return;

    router.post(`/admin/subscriptions/${subscription.id}/cancel`, {}, {
      onSuccess: () => toast.success('Assinatura cancelada'),
      onError: () => toast.error('Erro ao cancelar assinatura'),
    });
  };

  const handleReactivateSubscription = (subscription) => {
    router.post(`/admin/subscriptions/${subscription.id}/reactivate`, {}, {
      onSuccess: () => toast.success('Assinatura reativada'),
      onError: () => toast.error('Erro ao reativar assinatura'),
    });
  };

  const handleApprovePayment = (payment) => {
    router.post(`/admin/payments/${payment.id}/approve`, {}, {
      onSuccess: () => toast.success('Pagamento aprovado'),
      onError: () => toast.error('Erro ao aprovar pagamento'),
    });
  };

  const handleRejectPayment = () => {
    if (!rejectDialog.payment) return;

    router.post(`/admin/payments/${rejectDialog.payment.id}/reject`, { reason: rejectReason }, {
      onSuccess: () => {
        toast.success('Pagamento rejeitado');
        setRejectDialog({ open: false, payment: null });
        setRejectReason("");
      },
      onError: () => toast.error('Erro ao rejeitar pagamento'),
    });
  };

  const handlePageChange = (page, type = 'page') => {
    router.get('/admin/subscriptions', { ...filters, [type]: page }, { preserveState: true });
  };

  const subscriptionsList = subscriptions?.data || [];
  const subsPagination = {
    current_page: subscriptions?.current_page || 1,
    last_page: subscriptions?.last_page || 1,
  };

  const paymentsList = payments?.data || [];
  const paymentsPagination = {
    current_page: payments?.current_page || 1,
    last_page: payments?.last_page || 1,
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Assinaturas & Pagamentos</h1>
          <p className="text-muted-foreground">Gerencie todas as assinaturas e pagamentos do sistema.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assinaturas Ativas</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.active_count || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Em Teste</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.trialing_count || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {parseFloat(stats.monthly_revenue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Churn</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.churn_rate || 0}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subscriptions" className="space-y-4">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions">
            <Card className="bg-card border-border backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-foreground">Assinaturas</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <form onSubmit={handleSearch} className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 w-48 bg-background border-border"
                      />
                    </form>
                    <Select value={filters.status || "all"} onValueChange={(v) => handleFilter('status', v)}>
                      <SelectTrigger className="w-40 bg-background border-border">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="trialing">Em teste</SelectItem>
                        <SelectItem value="canceled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.plan_id || "all"} onValueChange={(v) => handleFilter('plan_id', v)}>
                      <SelectTrigger className="w-40 bg-background border-border">
                        <SelectValue placeholder="Plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={String(plan.id)}>{plan.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Usuario</TableHead>
                      <TableHead className="text-muted-foreground">Plano</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Periodo</TableHead>
                      <TableHead className="text-right text-muted-foreground">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionsList.map((sub) => {
                      const config = statusConfig[sub.status] || statusConfig.active;
                      const StatusIcon = config.icon;
                      return (
                        <TableRow key={sub.id} className="border-border hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{sub.user?.name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{sub.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">{sub.plan?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={config.variant} className="gap-1">
                              <StatusIcon className={`w-3 h-3 ${config.color}`} />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {sub.current_period_start} - {sub.current_period_end}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border">
                                {sub.status === 'active' && (
                                  <DropdownMenuItem onClick={() => handleCancelSubscription(sub)}>
                                    <XCircle className="w-4 h-4 mr-2" /> Cancelar
                                  </DropdownMenuItem>
                                )}
                                {sub.status === 'canceled' && (
                                  <DropdownMenuItem onClick={() => handleReactivateSubscription(sub)}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Reativar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {subsPagination.last_page > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Pagina {subsPagination.current_page} de {subsPagination.last_page}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(subsPagination.current_page - 1)}
                        disabled={subsPagination.current_page === 1}
                        className="border-border"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(subsPagination.current_page + 1)}
                        disabled={subsPagination.current_page === subsPagination.last_page}
                        className="border-border"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="bg-card border-border backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Pagamentos</CardTitle>
                  <Select value={filters.payment_status || "all"} onValueChange={(v) => handleFilter('payment_status', v)}>
                    <SelectTrigger className="w-40 bg-background border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Usuario</TableHead>
                      <TableHead className="text-muted-foreground">Plano</TableHead>
                      <TableHead className="text-muted-foreground">Valor</TableHead>
                      <TableHead className="text-muted-foreground">Metodo</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Data</TableHead>
                      <TableHead className="text-right text-muted-foreground">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsList.map((payment) => {
                      const config = paymentStatusConfig[payment.status] || paymentStatusConfig.pending;
                      return (
                        <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{payment.user?.name || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">{payment.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{payment.plan_name}</TableCell>
                          <TableCell className="text-foreground font-medium">
                            {parseFloat(payment.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </TableCell>
                          <TableCell className="text-muted-foreground uppercase text-xs">
                            {payment.payment_method}
                          </TableCell>
                          <TableCell>
                            <Badge variant={config.variant} className={config.color}>
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{payment.created_at}</TableCell>
                          <TableCell className="text-right">
                            {payment.status === 'pending' && (
                              <div className="flex gap-1 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                                  onClick={() => handleApprovePayment(payment)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                  onClick={() => setRejectDialog({ open: true, payment })}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {paymentsPagination.last_page > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Pagina {paymentsPagination.current_page} de {paymentsPagination.last_page}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(paymentsPagination.current_page - 1, 'payments_page')}
                        disabled={paymentsPagination.current_page === 1}
                        className="border-border"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(paymentsPagination.current_page + 1, 'payments_page')}
                        disabled={paymentsPagination.current_page === paymentsPagination.last_page}
                        className="border-border"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, payment: null })}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Rejeitar Pagamento</DialogTitle>
            <DialogDescription>Informe o motivo da rejeicao.</DialogDescription>
          </DialogHeader>
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo da rejeicao..."
            className="bg-background border-border"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, payment: null })} className="border-border">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRejectPayment}>
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
