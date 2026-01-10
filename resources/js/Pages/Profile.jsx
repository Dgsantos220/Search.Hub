import { Head, router, usePage } from "@inertiajs/react";
import { Layout } from "@/Components/layout";
import { User, Mail, Phone, Calendar, Edit2, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export default function ProfilePage({ user: userData }) {
  const { auth } = usePage().props;
  const user = userData || auth?.user;
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = () => {
    setSaving(true);
    router.put('/profile', formData, {
      onSuccess: () => {
        toast.success(t('profile.toast.success'));
        setEditing(false);
      },
      onError: (errors) => toast.error(Object.values(errors)[0]),
      onFinish: () => setSaving(false),
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setEditing(false);
  };

  return (
    <>
      <Head title={t('profile.title')} />
      <Layout>
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('profile.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('profile.subtitle')}</p>
              </div>
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {t('profile.edit')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 text-muted-foreground rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t('profile.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t('profile.saving') : t('profile.save')}
                </button>
              </div>
            )}
          </div>

          <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-primary/10 to-transparent border-b border-white/10">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary text-3xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {t('profile.memberSince')} {user?.created_at}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {t('profile.name')}
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-white/5 rounded-lg text-white">{user?.name}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {t('profile.email')}
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-white/5 rounded-lg text-white">{user?.email}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {t('profile.phone')}
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-white/5 rounded-lg text-white">
                      {user?.phone || <span className="text-muted-foreground">{t('profile.notProvided')}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
