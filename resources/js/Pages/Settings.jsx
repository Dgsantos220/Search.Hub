import { Head, router, usePage } from "@inertiajs/react";
import { Layout } from "@/Components/layout";
import { Settings, Palette, Bell, Shield, Globe, Clock, Lock, Eye, EyeOff, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export default function SettingsPage({ user, settings, options, subscription }) {
  const { auth } = usePage().props;
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('preferences');

  // Opções de tema manuais caso não venham do backend
  const themeOptions = options?.themes || {
    'dark': 'Modo Escuro (Padrão)',
    'light': 'Modo Claro',
    'system': 'Sistema'
  };

  const [preferences, setPreferences] = useState({
    theme: settings?.theme || 'dark',
    language: settings?.language || 'pt-BR',
    timezone: settings?.timezone || 'America/Sao_Paulo',
  });

  const { t } = useTranslation(preferences.language);

  const [notifications, setNotifications] = useState({
    notifications_email: settings?.notifications_email ?? true,
    notifications_push: settings?.notifications_push ?? false,
  });

  const [security, setSecurity] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // Time preview
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Update time preview
    const timer = setInterval(() => {
      try {
        const time = new Date().toLocaleTimeString(preferences.language, {
          timeZone: preferences.timezone,
          hour: '2-digit',
          minute: '2-digit'
        });
        setCurrentTime(time);
      } catch (e) {
        setCurrentTime('--:--');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [preferences.timezone, preferences.language]);

  useEffect(() => {
    setPreferences({
      theme: settings?.theme || 'dark',
      language: settings?.language || 'pt-BR',
      timezone: settings?.timezone || 'America/Sao_Paulo',
    });
    setNotifications({
      notifications_email: settings?.notifications_email ?? true,
      notifications_push: settings?.notifications_push ?? false,
    });
    setTwoFactorEnabled(settings?.two_factor_enabled ?? false);
  }, [settings]);

  const handleSavePreferences = () => {
    setSaving(true);
    router.put('/settings/preferences', preferences, {
      preserveScroll: true,
      onSuccess: () => toast.success(preferences.language === 'en' ? 'Preferences saved' : 'Preferências salvas com sucesso'),
      onError: (errors) => toast.error(Object.values(errors)[0]),
      onFinish: () => setSaving(false),
    });
  };

  const handleSaveNotifications = () => {
    setSaving(true);
    router.put('/settings/notifications', notifications, {
      preserveScroll: true,
      onSuccess: () => toast.success(preferences.language === 'en' ? 'Notifications updated' : 'Notificações atualizadas'),
      onError: (errors) => toast.error(Object.values(errors)[0]),
      onFinish: () => setSaving(false),
    });
  };

  const handleChangePassword = () => {
    if (security.password !== security.password_confirmation) {
      toast.error('As senhas nao coincidem');
      return;
    }
    setSaving(true);
    router.put('/settings/security', security, {
      onSuccess: () => {
        toast.success(preferences.language === 'en' ? 'Password changed' : 'Senha alterada com sucesso');
        setSecurity({ current_password: '', password: '', password_confirmation: '' });
      },
      onError: (errors) => toast.error(Object.values(errors)[0]),
      onFinish: () => setSaving(false),
    });
  };

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(settings?.two_factor_enabled ?? false);
  const [toggling2FA, setToggling2FA] = useState(false);

  const handleToggleTwoFactor = () => {
    setToggling2FA(true);
    router.post('/settings/two-factor', {}, {
      preserveScroll: true,
      onSuccess: () => {
        setTwoFactorEnabled(!twoFactorEnabled);
        toast.success('Configuracao 2FA atualizada');
      },
      onError: (errors) => {
        toast.error(Object.values(errors)[0] || 'Erro ao atualizar 2FA');
      },
      onFinish: () => setToggling2FA(false),
    });
  };

  const tabs = [
    { id: 'preferences', label: t('settings.tabs.preferences'), icon: Palette },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'security', label: t('settings.tabs.security'), icon: Shield },
    { id: 'plan', label: t('settings.tabs.plan'), icon: CreditCard },
  ];

  return (
    <>
      <Head title={t('settings.title')} />
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
            </div>
          </div>

          <div className="flex gap-2 border-b border-border pb-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  {t('settings.preferences.title')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Palette className="w-4 h-4 text-muted-foreground" />
                      {t('settings.preferences.theme')}
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => {
                        const newTheme = e.target.value;
                        setPreferences({ ...preferences, theme: newTheme });
                        const root = window.document.documentElement;
                        root.classList.remove('light', 'dark');
                        if (newTheme === 'system') {
                          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                          root.classList.add(systemTheme);
                        } else {
                          root.classList.add(newTheme);
                        }
                        localStorage.setItem('theme', newTheme);
                      }}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50"
                    >
                      {Object.entries(themeOptions).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      {t('settings.preferences.language')}
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50"
                    >
                      {Object.entries(options?.languages || {}).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {t('settings.preferences.timezone')}
                      </div>
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {currentTime}
                      </span>
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50"
                    >
                      {Object.entries(options?.timezones || {}).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? t('settings.preferences.saving') : t('settings.preferences.save')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  {t('settings.notifications.title')}
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-foreground">{t('settings.notifications.email')}</div>
                      <div className="text-xs text-muted-foreground">{t('settings.notifications.emailDesc')}</div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, notifications_email: !notifications.notifications_email })}
                      className={`w-12 h-6 rounded-full transition-colors ${notifications.notifications_email ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                    >
                      <div className={`w-5 h-5 bg-card rounded-full transition-transform ${notifications.notifications_email ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-foreground">{t('settings.notifications.push')}</div>
                      <div className="text-xs text-muted-foreground">{t('settings.notifications.pushDesc')}</div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, notifications_push: !notifications.notifications_push })}
                      className={`w-12 h-6 rounded-full transition-colors ${notifications.notifications_push ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                    >
                      <div className={`w-5 h-5 bg-card rounded-full transition-transform ${notifications.notifications_push ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? t('settings.notifications.saving') : t('settings.notifications.save')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {t('settings.security.title')}
                </h2>

                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{t('settings.security.2fa')}</div>
                      <div className="text-xs text-muted-foreground">{t('settings.security.2faDesc')}</div>
                    </div>
                    <button
                      onClick={handleToggleTwoFactor}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${twoFactorEnabled
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                    >
                      {twoFactorEnabled ? t('settings.security.disable') : t('settings.security.enable')}
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-md font-medium text-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('settings.security.changePw')}
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">{t('settings.security.currentPw')}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={security.current_password}
                          onChange={(e) => setSecurity({ ...security, current_password: e.target.value })}
                          className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 pr-10"
                          placeholder={t('settings.security.currentPwPlace')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">{t('settings.security.newPw')}</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={security.password}
                        onChange={(e) => setSecurity({ ...security, password: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50"
                        placeholder={t('settings.security.newPwPlace')}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">{t('settings.security.confirmPw')}</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={security.password_confirmation}
                        onChange={(e) => setSecurity({ ...security, password_confirmation: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50"
                        placeholder={t('settings.security.confirmPwPlace')}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !security.current_password || !security.password}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? t('settings.security.saving') : t('settings.security.savePw')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'plan' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  {t('settings.plan.title')}
                </h2>

                <div className="p-6 bg-muted/30 rounded-xl border border-border">
                  {subscription ? (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{subscription.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                            ${subscription.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}
                                        `}>
                              {subscription.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">R$ {parseFloat(subscription.price).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">/ mês</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                          <div className="text-sm text-muted-foreground">{t('settings.plan.nextBilling')}</div>
                          <div className="font-medium">{subscription.next_billing}</div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium transition-colors">
                          {t('settings.plan.manage')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">{t('settings.plan.noPlan')}</h3>
                      <button onClick={() => router.visit('/plans')} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/10 transition-colors">
                        {t('settings.plan.upgrade')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
