import { Head, Link, useForm } from '@inertiajs/react';
import { ShieldCheck, Loader2, Lock, User } from "lucide-react";
import Turnstile from 'react-turnstile';
import { useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";

export default function Login({ status, canResetPassword }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        turnstile_token: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    useEffect(() => {
        // Enforce theme application on Login page
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        if (savedTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(savedTheme);
        }
    }, []);

    return (
        <>
            <Head title={t('auth.login.heroTitle')} />
            <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-gradient-to-br from-background via-background to-primary/10"></div>
                    <div className="absolute inset-0 bg-background/90"></div>
                </div>

                <div className="relative z-10 w-full max-w-md p-6">
                    <div className="mb-8 text-center space-y-2">
                        <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_30px_-5px_rgba(0,240,255,0.3)]">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Los <span className="text-primary">Dados</span>
                        </h1>
                        <p className="text-muted-foreground text-sm font-mono">
                            {t('auth.login.heroSubtitle')}
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-400 text-center">
                            {status}
                        </div>
                    )}

                    <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{t('auth.email')}</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full bg-background/50 border border-border rounded-lg py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                        placeholder="email@exemplo.com"
                                        autoComplete="username"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{t('auth.password')}</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full bg-background/50 border border-border rounded-lg py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                        placeholder="•••••"
                                        autoComplete="current-password"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-border bg-background/50 text-primary focus:ring-primary/50"
                                />
                                <label htmlFor="remember" className="ml-2 text-xs text-muted-foreground font-mono">
                                    {t('auth.remember')}
                                </label>
                            </div>

                            <div className="flex justify-center my-4 opacity-80 scale-90 origin-center">
                                <Turnstile
                                    sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                                    onVerify={(token) => setData('turnstile_token', token)}
                                    theme="dark"
                                />
                            </div>
                            {errors.turnstile && (
                                <div className="text-red-400 text-xs text-center mb-4 font-mono">
                                    {errors.turnstile}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_-5px_rgba(0,240,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t('auth.login.authenticating')}
                                    </>
                                ) : (
                                    t('auth.login.action')
                                )}
                            </button>
                        </form>

                        <div className="mt-6 flex items-center justify-between text-xs font-mono">
                            {canResetPassword && (
                                <Link href={route('password.request')}>
                                    <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                                        {t('auth.forgotPassword')}
                                    </span>
                                </Link>
                            )}
                            <Link href={route('register')}>
                                <span className="text-primary hover:text-primary/80 cursor-pointer transition-colors">
                                    {t('auth.register')}
                                </span>
                            </Link>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-muted-foreground font-mono opacity-50">
                                {t('auth.login.footer')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
