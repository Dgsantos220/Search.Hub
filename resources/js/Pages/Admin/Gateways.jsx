import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Textarea } from "@/Components/ui/textarea";

const gatewayInfo = {
  stripe: {
    name: "Stripe",
    description: "Processamento de cartoes internacional com suporte a multiplas moedas",
    icon: CreditCard,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    fields: [
      { key: "public_key", label: "Public Key", placeholder: "pk_test_...", type: "text" },
      { key: "secret_key", label: "Secret Key", placeholder: "sk_test_...", type: "password" },
      { key: "webhook_secret", label: "Webhook Secret", placeholder: "whsec_...", type: "password" },
    ],
    defaultPayload: JSON.stringify({
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_123456789" } }
    }, null, 2)
  },
  mercadopago: {
    name: "Mercado Pago",
    description: "PIX, boletos e cartoes para o mercado brasileiro",
    icon: Wallet,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    fields: [
      { key: "access_token", label: "Access Token", placeholder: "APP_USR-...", type: "password" },
      { key: "public_key", label: "Public Key", placeholder: "APP_USR-...", type: "text" },
      { key: "webhook_secret", label: "Webhook Secret (opcional)", placeholder: "Seu secret", type: "password" },
    ],
    defaultPayload: JSON.stringify({
      type: "payment",
      data: { id: "123456789" },
      action: "payment.created"
    }, null, 2)
  },
};

export default function AdminGateways({ gateways = {} }) {
  const [saving, setSaving] = useState({});
  const [testing, setTesting] = useState({});
  const [simulating, setSimulating] = useState(false);
  const [simulationProvider, setSimulationProvider] = useState(null);
  const [simulationPayload, setSimulationPayload] = useState("");

  const [formData, setFormData] = useState(() => {
    const initial = {};
    Object.keys(gatewayInfo).forEach((provider) => {
      initial[provider] = {
        enabled: gateways[provider]?.enabled || false,
        sandbox_mode: gateways[provider]?.sandbox_mode ?? true,
        public_key: "",
        secret_key: "",
        access_token: "",
        webhook_secret: "",
      };
    });
    return initial;
  });
  const [showSecrets, setShowSecrets] = useState({});

  const handleInputChange = (provider, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }));
  };

  const handleSave = (provider) => {
    setSaving((prev) => ({ ...prev, [provider]: true }));

    const data = { ...formData[provider] };
    Object.keys(data).forEach((key) => {
      if (data[key] === "" || data[key] === null) {
        delete data[key];
      }
    });

    router.put(`/admin/gateways/${provider}`, data, {
      onSuccess: () => {
        toast.success(`Configuracoes do ${gatewayInfo[provider].name} salvas`);
        setFormData((prev) => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            public_key: "",
            secret_key: "",
            access_token: "",
            webhook_secret: "",
          },
        }));
      },
      onError: () => toast.error('Erro ao salvar configuracoes'),
      onFinish: () => setSaving((prev) => ({ ...prev, [provider]: false })),
    });
  };

  const handleTest = (provider) => {
    setTesting((prev) => ({ ...prev, [provider]: true }));

    router.post(`/admin/gateways/${provider}/test`, {}, {
      onSuccess: () => toast.success('Conexao testada com sucesso'),
      onError: () => toast.error('Falha ao testar conexao'),
      onFinish: () => setTesting((prev) => ({ ...prev, [provider]: false })),
    });
  };

  const openSimulation = (provider) => {
    setSimulationProvider(provider);
    setSimulationPayload(gatewayInfo[provider].defaultPayload);
    setSimulating(true);
  };

  const runSimulation = () => {
    if (!simulationProvider) return;

    try {
      const payload = JSON.parse(simulationPayload);

      // Use axios directly or api route via router? Simulation route is in API, not Inertia page controller.
      // We can use router.post if we want inertia handling, or fetch/axios.
      // Since it is an API route in api.php, let's use fetch or axios if available. 
      // But router.post works too if we enable it in web.php or use absolute URL.
      // Actually, my route is in api.php: api.admin.gateways.simulate

      // Let's use fetch for API calls to avoid full page reload logic of Inertia, or use axios.
      // Assuming axios is globally available or imported. If not, use fetch.

      window.axios.post(`/api/admin/gateways/${simulationProvider}/simulate-webhook`, payload)
        .then((response) => {
          toast.success("Simulacao enviada! Verifique os logs.");
          setSimulating(false);
        })
        .catch((error) => {
          toast.error("Erro na simulacao: " + (error.response?.data?.message || error.message));
        });

    } catch (e) {
      toast.error("JSON invalido");
    }
  };

  const toggleSecret = (provider, field) => {
    setShowSecrets((prev) => ({
      ...prev,
      [`${provider}_${field}`]: !prev[`${provider}_${field}`],
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Gateways de Pagamento</h1>
          <p className="text-muted-foreground">Configure os provedores de pagamento disponiveis.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(gatewayInfo).map(([provider, info]) => {
            const Icon = info.icon;
            const gateway = gateways[provider] || {};
            const form = formData[provider] || {};

            return (
              <Card key={provider} className="bg-card border-border backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${info.bgColor}`}>
                        <Icon className={`w-6 h-6 ${info.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          {info.name}
                          {gateway.enabled && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Ativo
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{info.description}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={form.enabled}
                      onCheckedChange={(checked) => handleInputChange(provider, 'enabled', checked)}
                    />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Modo Sandbox</span>
                    </div>
                    <Switch
                      checked={form.sandbox_mode}
                      onCheckedChange={(checked) => handleInputChange(provider, 'sandbox_mode', checked)}
                    />
                  </div>

                  {form.sandbox_mode && (
                    <div className="flex items-center gap-2 text-yellow-500 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Ambiente de teste - nenhuma cobranca real sera feita
                    </div>
                  )}

                  {info.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-foreground">{field.label}</Label>
                      <div className="relative">
                        <Input
                          type={field.type === 'password' && !showSecrets[`${provider}_${field.key}`] ? 'password' : 'text'}
                          value={form[field.key] || ""}
                          onChange={(e) => handleInputChange(provider, field.key, e.target.value)}
                          placeholder={gateway.has_credentials ? '••••••••' : field.placeholder}
                          className="bg-background border-border pr-10"
                        />
                        {field.type === 'password' && (
                          <button
                            type="button"
                            onClick={() => toggleSecret(provider, field.key)}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          >
                            {showSecrets[`${provider}_${field.key}`] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="p-3 rounded-lg bg-background border border-border">
                    <Label className="text-muted-foreground text-xs">Webhook URL</Label>
                    <p className="text-foreground text-sm font-mono mt-1 break-all">
                      {gateway.webhook_url || `${window.location.origin}/api/webhooks/${provider}`}
                    </p>
                  </div>

                  {gateway.last_tested_at && (
                    <div className="flex items-center gap-2 text-sm">
                      {gateway.test_status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-muted-foreground">
                        Ultimo teste: {gateway.last_tested_at}
                      </span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-2">
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className="flex-1 border-border"
                      onClick={() => handleTest(provider)}
                      disabled={testing[provider] || !gateway.has_credentials}
                    >
                      {testing[provider] ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="w-4 h-4 mr-2" />
                      )}
                      Testar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleSave(provider)}
                      disabled={saving[provider]}
                    >
                      {saving[provider] ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Salvar
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
                    onClick={() => openSimulation(provider)}
                  >
                    Simular Webhook (Debug)
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={simulating} onOpenChange={setSimulating}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Simular Webhook ({gatewayInfo[simulationProvider]?.name})</DialogTitle>
            <DialogDescription>
              Insira o payload JSON para simular um evento de webhook.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              className="font-mono text-xs bg-background border-border h-[200px]"
              value={simulationPayload}
              onChange={(e) => setSimulationPayload(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSimulating(false)} className="border-border">Cancelar</Button>
            <Button onClick={runSimulation}>Disparar Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
