import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import { Badge } from "@/Components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/Components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/Components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Power,
  Loader2,
  Users,
  X,
  RotateCcw
} from "lucide-react";
import { router, useForm } from "@inertiajs/react";
import { toast } from "sonner";

const emptyPlan = {
  name: "",
  description: "",
  price: 0,
  interval: "monthly",
  features: [],
  is_active: true,
};

export default function AdminPlans({ plans = [] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [featureInput, setFeatureInput] = useState("");

  const { data, setData, post, put, processing, reset } = useForm(emptyPlan);

  const openCreateModal = () => {
    setEditingPlan(null);
    reset();
    setData(emptyPlan);
    setFeatureInput("");
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setData({
      name: plan.name || "",
      description: plan.description || "",
      price: plan.price || 0,
      interval: plan.interval || "monthly",
      features: plan.features || [],
      is_active: plan.is_active ?? true,
    });
    setFeatureInput("");
    setModalOpen(true);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setData('features', [...data.features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index) => {
    setData('features', data.features.filter((_, i) => i !== index));
  };

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingPlan) {
      router.put(`/admin/plans/${editingPlan.id}`, data, {
        onSuccess: () => {
          toast.success('Plano atualizado com sucesso');
          setModalOpen(false);
        },
        onError: () => toast.error('Erro ao atualizar plano'),
      });
    } else {
      router.post('/admin/plans', data, {
        onSuccess: () => {
          toast.success('Plano criado com sucesso');
          setModalOpen(false);
        },
        onError: () => toast.error('Erro ao criar plano'),
      });
    }
  };

  const handleToggleActive = (plan) => {
    router.post(`/admin/plans/${plan.id}/toggle`, {}, {
      onSuccess: () => toast.success(`Plano ${plan.is_active ? 'desativado' : 'ativado'}`),
      onError: () => toast.error('Erro ao alterar status'),
    });
  };

  const handleDuplicate = (plan) => {
    router.post(`/admin/plans/${plan.id}/duplicate`, {}, {
      onSuccess: () => toast.success('Plano duplicado com sucesso'),
      onError: () => toast.error('Erro ao duplicar plano'),
    });
  };

  const handleDelete = (plan) => {
    if (!confirm(`Tem certeza que deseja excluir o plano "${plan.name}"?`)) return;

    router.delete(`/admin/plans/${plan.id}`, {
      onSuccess: () => toast.success('Plano excluido com sucesso'),
      onError: () => toast.error('Erro ao excluir plano'),
    });
  };

  const handleRestore = (planId) => {
    router.post(`/admin/plans/${planId}/restore`, {}, {
      onSuccess: () => toast.success('Plano restaurado com sucesso'),
      onError: () => toast.error('Erro ao restaurar plano'),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Gerenciar Planos</h1>
            <p className="text-muted-foreground">Configure os planos de assinatura disponiveis.</p>
          </div>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Plano
          </Button>
        </div>

        <Card className="bg-card border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Planos ({plans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum plano cadastrado. Crie o primeiro plano!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">Preco</TableHead>
                    <TableHead className="text-muted-foreground">Intervalo</TableHead>
                    <TableHead className="text-muted-foreground">Assinantes</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id} className={`border-border hover:bg-muted/50 ${plan.deleted_at ? 'opacity-50' : ''}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{plan.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{plan.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {formatPrice(plan.price)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {plan.interval === 'monthly' ? 'Mensal' : 'Anual'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{plan.subscriptions_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.deleted_at ? (
                          <Badge variant="outline" className="border-red-500/30 text-red-400">
                            Excluido
                          </Badge>
                        ) : plan.is_active ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-white/20 text-muted-foreground">
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                            {plan.deleted_at ? (
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-muted"
                                onClick={() => handleRestore(plan.id)}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" /> Restaurar
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-muted"
                                  onClick={() => openEditModal(plan)}
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-muted"
                                  onClick={() => handleDuplicate(plan)}
                                >
                                  <Copy className="mr-2 h-4 w-4" /> Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-muted"
                                  onClick={() => handleToggleActive(plan)}
                                >
                                  <Power className="mr-2 h-4 w-4" />
                                  {plan.is_active ? 'Desativar' : 'Ativar'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-red-500/10 text-red-500 hover:text-red-400 focus:text-red-400"
                                  onClick={() => handleDelete(plan)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
              </DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Atualize as informacoes do plano.' : 'Preencha os dados do novo plano.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Nome</Label>
                  <Input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ex: Plano Pro"
                    className="bg-background border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Preco (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.price}
                    onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Descricao</Label>
                <Input
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Descricao do plano..."
                  className="bg-background border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Intervalo</Label>
                  <select
                    value={data.interval}
                    onChange={(e) => setData('interval', e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', checked)}
                  />
                  <Label className="text-foreground">Plano Ativo</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="Digite uma feature e pressione Enter"
                    className="bg-background border-border"
                  />
                  <Button type="button" variant="outline" onClick={addFeature} className="border-border">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {data.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="bg-muted gap-1">
                        {feature}
                        <button type="button" onClick={() => removeFeature(index)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="border-border">
                  Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingPlan ? 'Atualizar' : 'Criar'} Plano
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
