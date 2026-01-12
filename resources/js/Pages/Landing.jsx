import { Link } from "@inertiajs/react";
import { ShieldCheck, Search, Database, Globe, ChevronRight, MessageCircle, Lock, Zap, Users, CheckCircle, BarChart3, Eye, Smartphone } from "lucide-react";
import { ModeToggle } from "@/Components/mode-toggle";
import backgroundImage from "@assets/generated_images/features.png";
import { useTranslation } from "@/hooks/use-translation";

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    { key: 'unified', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { key: 'smart', icon: Search, color: 'text-primary', bg: 'bg-primary/10' },
    { key: 'national', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const howSteps = [1, 2, 3];

  const modules = [
    { key: 'cpf', icon: Search },
    { key: 'name', icon: Users },
    { key: 'phone', icon: Smartphone },
    { key: 'relatives', icon: Users },
    { key: 'photos', icon: Eye },
    { key: 'cnpj', icon: BarChart3 },
  ];

  const whyCards = [
    { key: 'realtime', icon: Zap },
    { key: 'location', icon: Eye },
    { key: 'security', icon: Lock },
    { key: 'reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground">
      {/* Background Image Layer with Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={backgroundImage}
          alt="Background"
          className="w-full h-full object-cover opacity-40 animate-in fade-in duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <nav className="relative z-50 w-full border-b border-border bg-background/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <span className="font-mono font-bold tracking-tighter text-lg md:text-xl text-foreground">
              Los <span className="text-primary">Dados</span>
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/login" className="hidden md:block">
              <button className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 md:px-0">
                {t('landing.nav.enter')}
              </button>
            </Link>
            <Link href="/register">
              <button className="px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm font-bold transition-all shadow-[0_0_15px_-3px_hsl(var(--primary))] hover:shadow-[0_0_25px_-5px_hsl(var(--primary))]">
                {t('landing.nav.start')}
              </button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-20 md:pb-32">
        <div className="max-w-4xl space-y-6 md:space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs md:text-sm font-mono text-primary/80 mb-2 md:mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse"></span>
            {t('landing.hero.badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground leading-[1.1] md:leading-[1.1]">
            {t('landing.hero.title1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-blue-600">
              {t('landing.hero.title2')}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground max-w-xl md:max-w-2xl leading-relaxed">
            {t('landing.hero.desc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 rounded-lg bg-foreground text-background font-bold text-base md:text-lg hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 group">
                {t('landing.hero.ctaRequest')}
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 rounded-lg bg-muted border border-border text-foreground font-bold text-base md:text-lg hover:bg-muted/80 transition-colors backdrop-blur-md flex items-center justify-center gap-2">
                <Search className="w-4 h-4 md:w-5 md:h-5" />
                {t('landing.hero.ctaDemo')}
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-200">
          {features.map((section) => (
            <div key={section.key} className="p-8 rounded-2xl bg-card border border-border backdrop-blur-sm hover:shadow-lg transition-all group">
              <div className={`w-12 h-12 rounded-lg ${section.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <section.icon className={`w-6 h-6 ${section.color}`} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t(`landing.features.${section.key}.title`)}</h3>
              <p className="text-muted-foreground">
                {t(`landing.features.${section.key}.desc`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-32 border-t border-border pt-16 text-center">
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-8">
            {t('landing.trusted')}
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-bold text-foreground">TECHCORP</span>
            <span className="text-xl font-bold text-foreground">FINANCE.IO</span>
            <span className="text-xl font-bold text-foreground">SECUREDATA</span>
            <span className="text-xl font-bold text-foreground">GLOBAL SYSTEMS</span>
          </div>
        </div>

        <div className="mt-40 border-t border-border pt-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t('landing.how.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.how.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howSteps.map((step) => (
              <div key={step} className="relative p-8 rounded-2xl bg-card border border-border backdrop-blur-sm hover:shadow-lg transition-all">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">{step}</div>
                <h3 className="text-xl font-bold text-white mb-3 pt-4">{t(`landing.how.step${step}.title`)}</h3>
                <p className="text-muted-foreground">{t(`landing.how.step${step}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-40 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('landing.cpf.title')}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('landing.cpf.desc')}
            </p>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-foreground">{t(`landing.cpf.check${i}.title`)}</h4>
                    <p className="text-muted-foreground text-sm">{t(`landing.cpf.check${i}.desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/register">
              <button className="mt-8 px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-colors">
                {t('landing.cpf.cta')}
              </button>
            </Link>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border backdrop-blur-sm">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-mono">{t('landing.cpf.demo.labelCpf')}</p>
                <p className="text-lg font-bold text-foreground">123.456.789-00</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-muted-foreground">{t('landing.cpf.demo.labelName')}</p>
                  <p className="font-bold text-foreground text-sm">Joao Silva Santos</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-muted-foreground">{t('landing.cpf.demo.labelStatus')}</p>
                  <p className="font-bold text-green-400 text-sm">Regular</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-muted-foreground">{t('landing.cpf.demo.labelPhones')}</p>
                  <p className="font-bold text-foreground text-sm">3</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-muted-foreground">{t('landing.cpf.demo.labelAddr')}</p>
                  <p className="font-bold text-foreground text-sm">5</p>
                </div>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-2">
                <Lock className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-400">{t('landing.cpf.demo.title')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-40 border-t border-border pt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t('landing.modules.title')}</h2>
            <p className="text-xl text-muted-foreground">{t('landing.modules.desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <mod.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{t(`landing.modules.cards.${mod.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`landing.modules.cards.${mod.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-40 border-t border-border pt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t('landing.why.title')}</h2>
            <p className="text-xl text-muted-foreground">{t('landing.why.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {whyCards.map((card) => (
              <div key={card.key} className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-colors">
                <card.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">{t(`landing.why.cards.${card.key}.title`)}</h3>
                <p className="text-muted-foreground">{t(`landing.why.cards.${card.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-40 border-t border-border pt-32 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <p className="text-4xl md:text-5xl font-bold text-primary mb-2">99.9%</p>
            <p className="text-muted-foreground">{t('landing.stats.accuracy')}</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold text-primary mb-2">&lt;3s</p>
            <p className="text-muted-foreground">{t('landing.stats.time')}</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold text-primary mb-2">50+</p>
            <p className="text-muted-foreground">{t('landing.stats.modules')}</p>
          </div>
        </div>

        <div className="mt-40 border-t border-border pt-32 pb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('landing.footer.ready')}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('landing.footer.desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-10 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl">
                {t('landing.footer.ctaPanel')}
              </button>
            </Link>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              <button className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {t('landing.footer.ctaWhatsapp')}
              </button>
            </a>
          </div>
        </div>
      </main>

      <a
        href="https://wa.me/5511999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-bounce"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>

      <footer className="border-t border-border bg-muted/20 backdrop-blur-xl py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            <span className="font-mono font-bold text-muted-foreground">{t('landing.footer.rights')}</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors cursor-pointer">
              {t('landing.footer.terms')}
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors cursor-pointer">
              {t('landing.footer.privacy')}
            </Link>
            <a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
