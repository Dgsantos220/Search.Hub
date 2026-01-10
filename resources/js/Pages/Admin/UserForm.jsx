import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { ChevronLeft, Save, Loader2, User, Shield, CreditCard } from "lucide-react";
import { router, Link, useForm } from "@inertiajs/react";
import { toast } from "sonner";

export default function UserForm({ user, roles = [], plans = [], mode = 'create' }) {
  const isEdit = mode === 'edit';

  const { data, setData, post, put, processing, errors, transform } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    password_confirmation: '',
    status: user?.status || 'active',
    roles: user?.roles || [],
    send_invite: false,
    create_subscription: false,
    plan_id: '',
    subscription_status: 'active',
    trial_days: 0,
  });

  const handleRoleToggle = (roleId) => {
    const currentRoles = [...data.roles];
    const numericId = Number(roleId);
    const index = currentRoles.findIndex(id => Number(id) === numericId);
    if (index > -1) {
      currentRoles.splice(index, 1);
    } else {
      currentRoles.push(numericId);
    }
    setData('roles', currentRoles);
  };

  const isRoleSelected = (roleId) => {
    return data.roles.some(id => Number(id) === Number(roleId));
  };

  // Configure transform to remove empty password on edit
  transform((data) => ({
    ...data,
    password: (isEdit && data.password === '') ? undefined : data.password,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      put(`/admin/users/${user.id}`, {
        onSuccess: () => toast.success('Usuario atualizado com sucesso'),
        onError: () => toast.error('Erro ao atualizar usuario'),
      });
    } else {
      post('/admin/users', {
        onSuccess: () => toast.success('Usuario criado com sucesso'),
        onError: () => toast.error('Erro ao criar usuario'),
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? 'Editar Usuario' : 'Novo Usuario'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Atualize os dados do usuario' : 'Preencha os dados para criar um novo usuario'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-muted border border-border">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" /> Perfil
              </TabsTrigger>
              <TabsTrigger value="roles" className="gap-2">
                <Shield className="w-4 h-4" /> Funcoes
              </TabsTrigger>
              {!isEdit && (
                <TabsTrigger value="subscription" className="gap-2">
                  <CreditCard className="w-4 h-4" /> Assinatura
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Dados do Usuario</CardTitle>
                  <CardDescription>Informacoes basicas do usuario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="bg-background border-border"
                        placeholder="Nome completo"
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="bg-background border-border"
                        placeholder="email@exemplo.com"
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="bg-background border-border"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">
                        {isEdit ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="bg-background border-border"
                        placeholder="********"
                      />
                      {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation">Confirmar Senha</Label>
                      <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="bg-background border-border"
                        placeholder="********"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                      <SelectTrigger className="w-48 bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="blocked">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!isEdit && (
                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                      <Switch
                        id="send_invite"
                        checked={data.send_invite}
                        onCheckedChange={(checked) => setData('send_invite', checked)}
                      />
                      <Label htmlFor="send_invite" className="text-sm">
                        Enviar convite por email (gerar senha automatica)
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Funcoes do Usuario</CardTitle>
                  <CardDescription>Selecione as funcoes que este usuario tera</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${isRoleSelected(role.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                          }`}
                        onClick={() => handleRoleToggle(role.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${isRoleSelected(role.id)
                            ? 'bg-primary border-primary'
                            : 'border-border'
                            }`}>
                            {isRoleSelected(role.id) && (
                              <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{role.display_name || role.name}</p>
                            {role.description && (
                              <p className="text-xs text-muted-foreground">{role.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.roles && <p className="text-sm text-red-500 mt-2">{errors.roles}</p>}
                </CardContent>
              </Card>
            </TabsContent>

            {(!isEdit || !user?.subscription) && (
              <TabsContent value="subscription">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Assinatura</CardTitle>
                    <CardDescription>Configure a assinatura do usuario</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="create_subscription"
                        checked={data.create_subscription}
                        onCheckedChange={(checked) => setData('create_subscription', checked)}
                      />
                      <Label htmlFor="create_subscription">{isEdit ? "Adicionar assinatura agora" : "Criar assinatura ao cadastrar"}</Label>
                    </div>

                    {data.create_subscription && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Plano *</Label>
                            <Select value={data.plan_id} onValueChange={(v) => setData('plan_id', v)}>
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Selecione um plano" />
                              </SelectTrigger>
                              <SelectContent>
                                {plans.map((plan) => (
                                  <SelectItem key={plan.id} value={String(plan.id)}>
                                    {plan.name} - R$ {parseFloat(plan.price).toFixed(2)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.plan_id && <p className="text-sm text-red-500">{errors.plan_id}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label>Status Inicial</Label>
                            <Select value={data.subscription_status} onValueChange={(v) => setData('subscription_status', v)}>
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="trialing">Em teste (trial)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Link href="/admin/users">
              <Button type="button" variant="outline" className="border-border hover:bg-muted">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90">
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> {isEdit ? 'Atualizar' : 'Criar Usuario'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
