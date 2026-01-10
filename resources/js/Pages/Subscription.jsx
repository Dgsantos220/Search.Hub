import { Head, router } from "@inertiajs/react";
import { Layout } from "@/Components/layout";
import { InfoCard, DataRow } from "@/Components/ui/info-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Progress } from "@/Components/ui/progress";
import { CreditCard, Calendar, Activity, TrendingUp, AlertCircle, History, RefreshCw, X, Loader2, Crown, Zap, Clock, Receipt } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { toast } from "sonner";

export default function SubscriptionPage({ subscription, payments = [], plans = [] }) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPaymentsDialog, setShowPaymentsDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const plan = subscription?.plan;
  const hasSubscription = subscription && subscription.status !== 'inactive';

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'ATIVO', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      trialing: { label: 'TRIAL', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      pending: { label: 'PENDENTE', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
      canceled: { label: 'CANCELADO', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
      expired: { label: 'EXPIRADO', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant="outline" className={`${config.className} px-3 py-1 font-mono`}>{config.label}</Badge>;
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleCancel = () => {
    setCanceling(true);
    router.post('/subscription/cancel', {}, {
      onSuccess: () => {
        toast.success('Assinatura sera cancelada ao final do periodo');
        setShowCancelDialog(false);
      },
      onError: () => toast.error('Erro ao cancelar assinatura'),
      onFinish: () => setCanceling(false),
    });
  };

  if (!hasSubscription) {
    return (
      <>
        <Head title="Assinatura" />
        <Layout>
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <Card className="bg-card/30 border-white/5">
              <CardContent className="p-12 text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Crown className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Nenhuma Assinatura Ativa</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Voce ainda nao possui uma assinatura ativa.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button onClick={() => router.visit('/plans')} className="gap-2">
                    <Zap className="w-4 h-4" />
                    Ver Planos Disponiveis
                  </Button>
                  <Button variant="outline" onClick={() => router.visit('/dashboard')} className="gap-2">
                    Voltar ao Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head title="Assinatura" />
      <Layout>
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Minha Assinatura</h1>
              <p className="text-muted-foreground font-mono mt-1">GERENCIAMENTO DE PLANO</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <InfoCard title="Plano Atual" icon={<Crown className="w-4 h-4" />} className="lg:col-span-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{plan?.name || 'Plano'}</div>
                  <div className="text-2xl font-mono text-primary font-bold">
                    {formatCurrency(plan?.price)}
                    <span className="text-sm text-muted-foreground font-normal">/{plan?.interval === 'monthly' ? 'mes' : 'ano'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(subscription?.status)}
                </div>
                <DataRow label="INICIO" value={subscription?.current_period_start || '---'} icon={<Calendar className="w-3 h-3" />} />
                <DataRow label="RENOVACAO" value={subscription?.current_period_end || '---'} icon={<Clock className="w-3 h-3" />} />
              </div>
            </InfoCard>

            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/30 border-white/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Recursos do Plano
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(plan?.features || []).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button onClick={() => router.visit('/plans')} className="gap-2 h-12">
                  <RefreshCw className="w-4 h-4" />
                  Trocar Plano
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentsDialog(true)} className="gap-2 h-12">
                  <Receipt className="w-4 h-4" />
                  Historico de Pagamentos
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelDialog(true)}
                  className="gap-2 h-12 text-red-400 hover:text-red-400 hover:bg-red-500/10 border-red-500/20"
                >
                  <X className="w-4 h-4" />
                  Cancelar Assinatura
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Cancelar Assinatura</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja cancelar? Voce perdera acesso ao final do periodo atual.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Manter Assinatura</Button>
              <Button variant="destructive" onClick={handleCancel} disabled={canceling} className="gap-2">
                {canceling && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar Cancelamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPaymentsDialog} onOpenChange={setShowPaymentsDialog}>
          <DialogContent className="bg-card border-white/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                Historico de Pagamentos
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Receipt className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Pagamento de Assinatura</div>
                        <div className="text-xs text-muted-foreground">{payment.created_at}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-white">{formatCurrency(payment.amount)}</div>
                      <Badge variant="outline" className={
                        payment.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }>
                        {payment.status === 'paid' ? 'PAGO' : payment.status === 'pending' ? 'PENDENTE' : 'FALHOU'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum pagamento encontrado</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </Layout>
    </>
  );
}
