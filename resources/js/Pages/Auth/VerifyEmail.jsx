import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Layout } from '@/Components/layout';
import { ShieldCheck, Mail, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function VerifyEmail({ status }) {
    const { auth } = usePage().props;

    // Polling para verificar se o email foi confirmado
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['auth'],
                onSuccess: (page) => {
                    if (page.props.auth.user?.email_verified_at) {
                        toast.success('Email verificado com sucesso!');
                        router.visit(route('dashboard'));
                    }
                },
                preserveScroll: true,
                preserveState: true,
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'), {
            onSuccess: () => toast.success('Link de verificação enviado com sucesso!'),
            onError: () => toast.error('Erro ao enviar link de verificação.'),
        });
    };

    return (
        <Layout hideNav={true}>
            <Head title="Verificação de E-mail" />

            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <div className="w-full max-w-md space-y-8 p-8 rounded-2xl bg-card border border-border backdrop-blur-xl relative overflow-hidden shadow-2xl">
                    {/* Background Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 text-center space-y-6">
                        <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                Verifique seu e-mail
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Obrigado por se cadastrar! Antes de começar, você precisa verificar seu endereço de e-mail clicando no link que acabamos de enviar para você.
                            </p>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                Um novo link de verificação foi enviado para o endereço de e-mail fornecido durante o registro.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <button
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {processing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                )}
                                Reenviar E-mail de Verificação
                            </button>

                            <div className="flex items-center justify-center gap-4 pt-2">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sair da conta
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <span className="font-mono font-bold tracking-tighter text-lg text-foreground/40">
                        Search<span className="text-primary/40">.Hub</span>
                    </span>
                </div>
            </div>
        </Layout>
    );
}
