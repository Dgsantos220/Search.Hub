import { Head, Link, useForm } from '@inertiajs/react';
import { ShieldAlert, Loader2, Mail, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function ForgotPassword({ status }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title={t('auth.forgot.title')} />
            <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-gradient-to-br from-background via-background to-primary/10"></div>
                    <div className="absolute inset-0 bg-background/90"></div>
                </div>

                <div className="relative z-10 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="mb-8 text-center space-y-2">
                        <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_30px_-5px_rgba(0,240,255,0.3)]">
                            <ShieldAlert className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {t('auth.forgot.heroTitle')}
                        </h1>
                        <p className="text-muted-foreground text-sm font-mono">
                            {t('auth.forgot.heroSubtitle')}
                        </p>
                    </div>

                    <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
                        {!status ? (
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{t('auth.forgot.emailLabel')}</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full bg-background/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                            placeholder="email@empresa.com.br"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_-5px_rgba(0,240,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t('auth.forgot.sending')}
                                        </>
                                    ) : (
                                        t('auth.forgot.submit')
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4 py-4">
                                <div className="text-emerald-400 font-mono text-lg">{t('auth.forgot.successTitle')}</div>
                                <p className="text-muted-foreground text-sm">
                                    {t('auth.forgot.successDescBefore')} <span className="text-white">{data.email}</span>{t('auth.forgot.successDescAfter')}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 text-center">
                            <Link href={route('login')} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white font-mono transition-colors">
                                <ArrowLeft className="w-3 h-3" />
                                {t('auth.forgot.backLink')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
