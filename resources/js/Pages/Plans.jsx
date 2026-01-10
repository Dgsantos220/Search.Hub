import { Head, router } from "@inertiajs/react";
import { Layout } from "@/Components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Crown, Zap, Check, X, Loader2, Star, Clock, ArrowLeft, Sparkles, Shield, Database, Headphones } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { toast } from "sonner";

export default function PlansPage({ plans = [], currentSubscription }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  const currentPlanId = currentSubscription?.plan_id;
  const hasActiveSubscription = currentSubscription && ['active', 'trialing'].includes(currentSubscription.status);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const isRecommended = (plan) => {
    const name = plan.name?.toLowerCase() || '';
    return name.includes('profissional') || name.includes('pro');
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowConfirmDialog(true);
  };

  const confirmSubscription = () => {
    if (!selectedPlan) return;
    setProcessing(true);

    router.post('/subscription/checkout', { plan_id: selectedPlan.id }, {
      onSuccess: (page) => {
        const url = page.props.flash?.url;
        if (url) {
          window.location.href = url;
        } else {
          toast.error('Pagamento indisponivel no momento');
          setShowConfirmDialog(false);
        }
      },
      onError: () => {
        toast.error('Pagamento indisponivel no momento');
        setShowConfirmDialog(false);
      },
      onFinish: () => setProcessing(false),
    });
  };

  const getPlanIcon = (index) => {
    const icons = [Database, Zap, Crown, Sparkles];
    const Icon = icons[index % icons.length];
    return <Icon className="w-6 h-6" />;
  };

  return (
    <>
      <Head title="Planos" />
      <Layout>
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">

          <div className="text-center space-y-4">
            <Button variant="ghost" onClick={() => router.visit('/dashboard')} className="mb-4 gap-2 text-muted-foreground hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary">
              <Sparkles className="w-3 h-3" />
              ESCOLHA SEU PLANO
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Planos e Precos</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para suas necessidades.
            </p>

            {hasActiveSubscription && (
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mt-4">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">
                  Voce esta no plano <strong>{currentSubscription?.plan_name}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.map((plan, index) => {
              const recommended = isRecommended(plan);
              const isCurrentPlan = currentPlanId === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`relative bg-card/30 border transition-all duration-300 hover:scale-[1.02] ${recommended ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-white/5 hover:border-white/10'
                    } ${isCurrentPlan ? 'ring-2 ring-emerald-500/50' : ''}`}
                >
                  {recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 gap-1.5">
                        <Star className="w-3 h-3 fill-current" />
                        RECOMENDADO
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-emerald-500 text-white px-3 py-1">SEU PLANO</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-8 pb-4">
                    <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${recommended ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-white/70 border border-white/10'
                      }`}>
                      {getPlanIcon(index)}
                    </div>
                    <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                    {plan.description && <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>}
                  </CardHeader>

                  <CardContent className="text-center pb-6">
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">{formatCurrency(plan.price)}</span>
                      <span className="text-muted-foreground text-sm">/{plan.interval === 'monthly' ? 'mes' : 'ano'}</span>
                    </div>

                    <div className="space-y-3 text-left">
                      {(plan.features || []).slice(0, 5).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="text-white/80">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-6 px-6">
                    <Button
                      className={`w-full h-12 gap-2 ${recommended ? '' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'}`}
                      variant={recommended ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(plan)}
                      disabled={isCurrentPlan || processing}
                    >
                      {isCurrentPlan ? (
                        <><Check className="w-4 h-4" /> Plano Atual</>
                      ) : hasActiveSubscription ? (
                        <><Zap className="w-4 h-4" /> Trocar Plano</>
                      ) : (
                        <><Zap className="w-4 h-4" /> Assinar Agora</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="text-center pt-8 pb-4">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /><span>Pagamento seguro</span></div>
              <div className="flex items-center gap-2"><Headphones className="w-4 h-4 text-blue-400" /><span>Suporte dedicado</span></div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /><span>Ativacao imediata</span></div>
            </div>
          </div>
        </div>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Confirmar Assinatura
              </DialogTitle>
              <DialogDescription className="pt-4">
                Voce esta prestes a assinar o plano <strong className="text-primary">{selectedPlan?.name}</strong> por{' '}
                <strong>{formatCurrency(selectedPlan?.price)}</strong>/{selectedPlan?.interval === 'monthly' ? 'mes' : 'ano'}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
              <Button onClick={confirmSubscription} disabled={processing} className="gap-2">
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Confirmar Assinatura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </>
  );
}
