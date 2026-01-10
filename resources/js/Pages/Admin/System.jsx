import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Copy, RefreshCw, Eye, EyeOff, ShieldAlert, Key, Database, Server, Loader2, Mail, Settings } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/Components/ui/badge";
import { Switch } from "@/Components/ui/switch";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

export default function AdminSystem({ systemStats = {}, apiKeys = {}, rateLimits = {}, maintenanceMode = false }) {
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [showTestKey, setShowTestKey] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [savingLimits, setSavingLimits] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [localMaintenanceMode, setLocalMaintenanceMode] = useState(maintenanceMode);
  const [limits, setLimits] = useState({
    requests_per_minute: rateLimits.requests_per_minute || 60,
    requests_per_day: rateLimits.requests_per_day || 10000,
  });
  const [savingMail, setSavingMail] = useState(false);
  const [mailSettings, setMailSettings] = useState({
    mail_mailer: systemStats.mail?.driver || 'smtp',
    mail_host: systemStats.mail?.host || '',
    mail_port: systemStats.mail?.port || 587,
    mail_username: systemStats.mail?.username || '',
    mail_password: '',
    mail_encryption: systemStats.mail?.encryption || 'tls',
    mail_from_address: systemStats.mail?.from_address || '',
    mail_from_name: systemStats.mail?.from_name || '',
  });

  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const handleRotateKeys = () => {
    if (!confirm('Tem certeza? Isso invalidara as chaves atuais imediatamente.')) return;

    setRotating(true);
    router.post('/admin/system/rotate-keys', { type: 'both' }, {
      onSuccess: () => toast.success('Chaves rotacionadas com sucesso'),
      onError: () => toast.error('Erro ao rotacionar chaves'),
      onFinish: () => setRotating(false),
    });
  };

  const handleCopyKey = (key) => {
    if (key) {
      navigator.clipboard.writeText(key);
      toast.success('Chave copiada para a area de transferencia');
    } else {
      toast.error('Nenhuma chave disponivel');
    }
  };

  const handleSaveLimits = () => {
    setSavingLimits(true);
    router.put('/admin/system/rate-limits', limits, {
      onSuccess: () => toast.success('Limites atualizados'),
      onError: () => toast.error('Erro ao atualizar limites'),
      onFinish: () => setSavingLimits(false),
    });
  };

  const handleToggleMaintenance = () => {
    const newMode = !localMaintenanceMode;
    setLocalMaintenanceMode(newMode);

    router.post('/admin/system/maintenance', {}, {
      onSuccess: () => toast.success(`Modo de manutencao ${newMode ? 'ativado' : 'desativado'}`),
      onError: () => {
        setLocalMaintenanceMode(!newMode);
        toast.error('Erro ao alterar modo de manutencao');
      },
    });
  };

  const handleClearCache = () => {
    setClearingCache(true);
    router.post('/admin/system/clear-cache', {}, {
      onSuccess: () => toast.success('Cache limpo com sucesso'),
      onError: () => toast.error('Erro ao limpar cache'),
      onFinish: () => setClearingCache(false),
    });
  };

  const handleSaveMail = () => {
    setSavingMail(true);
    router.put('/admin/system/mail', mailSettings, {
      onSuccess: () => toast.success('Configuracoes de e-mail atualizadas'),
      onError: () => toast.error('Erro ao atualizar configuracoes de e-mail'),
      onFinish: () => setSavingMail(false),
    });
  };

  const handleSendTestMail = () => {
    setSendingTest(true);
    router.post('/admin/system/test-email', { email: testEmail }, {
      onSuccess: () => toast.success('E-mail de teste enviado com sucesso!'),
      onError: () => toast.error('Erro ao enviar e-mail de teste. Verifique as credenciais.'),
      onFinish: () => setSendingTest(false),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">API Keys & Sistema</h1>
          <p className="text-muted-foreground">Gerencie chaves de acesso e configuracoes de seguranca.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-card border-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Banco de Dados</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{systemStats.database?.size_formatted || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Tamanho atual</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">PHP Version</CardTitle>
              <Server className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{systemStats.server?.php_version || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Laravel {systemStats.server?.laravel_version || ''}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cache</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{systemStats.cache?.driver || 'N/A'}</div>
              <p className="text-xs text-emerald-500">{systemStats.cache?.status || 'N/A'}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-card border-border backdrop-blur-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Configuracoes de E-mail (SMTP)
              </CardTitle>
              <CardDescription>
                Configure o servidor para envio de e-mails de verificacao e notificacoes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Servidor SMTP (Host)</Label>
                    <Input
                      value={mailSettings.mail_host}
                      onChange={(e) => setMailSettings(prev => ({ ...prev, mail_host: e.target.value }))}
                      placeholder="smtp.example.com"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Porta</Label>
                      <Input
                        type="number"
                        value={mailSettings.mail_port}
                        onChange={(e) => setMailSettings(prev => ({ ...prev, mail_port: parseInt(e.target.value) || 0 }))}
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Criptografia</Label>
                      <Input
                        value={mailSettings.mail_encryption}
                        onChange={(e) => setMailSettings(prev => ({ ...prev, mail_encryption: e.target.value }))}
                        placeholder="tls"
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Usuario</Label>
                    <Input
                      value={mailSettings.mail_username}
                      onChange={(e) => setMailSettings(prev => ({ ...prev, mail_username: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Senha</Label>
                    <Input
                      type="password"
                      value={mailSettings.mail_password}
                      onChange={(e) => setMailSettings(prev => ({ ...prev, mail_password: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">E-mail do Remetente</Label>
                    <Input
                      value={mailSettings.mail_from_address}
                      onChange={(e) => setMailSettings(prev => ({ ...prev, mail_from_address: e.target.value }))}
                      placeholder="noreply@example.com"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Nome do Remetente</Label>
                    <Input
                      value={mailSettings.mail_from_name}
                      onChange={(e) => setMailSettings(prev => ({ ...prev, mail_from_name: e.target.value }))}
                      placeholder="M7 Consultas"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="pt-8">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                      onClick={handleSaveMail}
                      disabled={savingMail}
                    >
                      {savingMail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                      Salvar Configuracoes de E-mail
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-border mt-6">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Testar Configuracao
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="bg-background border-border"
                    />
                    <Button
                      variant="outline"
                      className="border-border hover:bg-muted text-foreground"
                      onClick={handleSendTestMail}
                      disabled={sendingTest || !testEmail}
                    >
                      {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Teste'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Envie um e-mail de teste para verificar se as credenciais estao corretas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Chaves de API Mestra
              </CardTitle>
              <CardDescription>
                Essas chaves concedem acesso total ao sistema. Mantenha-as seguras.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Chave de Producao (Live)</Label>
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/50">Critico</Badge>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showLiveKey ? "text" : "password"}
                      value={apiKeys.has_live_key ? (showLiveKey ? apiKeys.live_key : apiKeys.live_key_masked || '••••••••••••••••') : 'Nenhuma chave gerada'}
                      className="bg-background border-border pr-10 font-mono text-sm"
                      readOnly
                    />
                    <button
                      onClick={() => setShowLiveKey(!showLiveKey)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      disabled={!apiKeys.has_live_key}
                    >
                      {showLiveKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-muted"
                    onClick={() => handleCopyKey(apiKeys.live_key)}
                    disabled={!apiKeys.has_live_key}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {apiKeys.live_key_last_used && (
                  <p className="text-xs text-muted-foreground">
                    Ultimo uso: {apiKeys.live_key_last_used}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Chave de Teste (Sandbox)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showTestKey ? "text" : "password"}
                      value={apiKeys.has_test_key ? (showTestKey ? apiKeys.test_key : apiKeys.test_key_masked || '••••••••••••••••') : 'Nenhuma chave gerada'}
                      className="bg-background border-border pr-10 font-mono text-sm"
                      readOnly
                    />
                    <button
                      onClick={() => setShowTestKey(!showTestKey)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      disabled={!apiKeys.has_test_key}
                    >
                      {showTestKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-muted"
                    onClick={() => handleCopyKey(apiKeys.test_key)}
                    disabled={!apiKeys.has_test_key}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  onClick={handleRotateKeys}
                  disabled={rotating}
                >
                  {rotating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Rotacionar Chaves
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Atencao: Rotacionar as chaves invalidara as atuais imediatamente.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-card border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Limites e Protecao (Rate Limiting)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Req/min por IP</Label>
                    <Input
                      type="number"
                      value={limits.requests_per_minute}
                      onChange={(e) => setLimits(prev => ({ ...prev, requests_per_minute: parseInt(e.target.value) || 0 }))}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Req/dia por Token</Label>
                    <Input
                      type="number"
                      value={limits.requests_per_day}
                      onChange={(e) => setLimits(prev => ({ ...prev, requests_per_day: parseInt(e.target.value) || 0 }))}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-muted text-foreground"
                  onClick={handleSaveLimits}
                  disabled={savingLimits}
                >
                  {savingLimits && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salvar Configuracoes
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Manutencao</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div>
                    <p className="font-bold text-red-500">Modo de Manutencao</p>
                    <p className="text-xs text-red-400">Desativa acesso a API para todos exceto admins</p>
                  </div>
                  <Switch
                    checked={localMaintenanceMode}
                    onCheckedChange={handleToggleMaintenance}
                  />
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleClearCache}
                  disabled={clearingCache}
                >
                  {clearingCache && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Limpar Cache do Sistema
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout >
  );
}
