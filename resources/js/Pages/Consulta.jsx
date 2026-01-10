import { Head, router, usePage, Link } from "@inertiajs/react";
import { Layout } from "@/Components/layout";
import { ProfileHeader } from "@/Components/ui/profile-header";
import { InfoCard, DataRow } from "@/Components/ui/info-card";
import { SearchInput } from "@/Components/ui/search-input";
import { usePersonSearch } from "@/hooks/use-person-search";
import {
  MapPin, Phone, Mail, Users, Briefcase,
  ChevronLeft, AlertTriangle, TrendingUp,
  Wallet, Vote, CreditCard, Download, Loader,
  User, Calendar, Search
} from "lucide-react";
import { useState, useEffect } from "react";
import { generateProfessionalPDF } from "@/lib/pdf-template";
import { toast } from "sonner";
import Turnstile from "react-turnstile";

export default function ConsultaPage({ query: propQuery, module: propModule, token: propToken }) {
  const { props } = usePage();
  const query = propQuery || props.query || "";
  const module = propModule || props.module || "cpf";
  const token = propToken || props.token; // Token vindo via prop ou Inertia shared props
  const decodedQuery = decodeURIComponent(query);
  const [page, setPage] = useState(1);
  const [yearFilter, setYearFilter] = useState('');
  const [ufFilter, setUfFilter] = useState('');
  const [pendingCpf, setPendingCpf] = useState(null); // State para CPF aguardando token

  const { data: searchResult, isLoading, error } = usePersonSearch(decodedQuery, module, page, {
    nome_mae: yearFilter,
    exato: ufFilter === 'true'
  }, token); // Passa o token para o hook

  const data = searchResult?.data;
  const isList = searchResult?.isList;

  const [exporting, setExporting] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

  // Salvar histórico quando dados são carregados com sucesso
  useEffect(() => {
    if (searchResult && !isLoading && !historySaved && !isList) {
      saveToHistory();
    }
  }, [searchResult, isLoading, historySaved, isList]);

  const saveToHistory = async () => {
    try {
      const payload = {
        tipo: module,
        query: decodedQuery,
        success: true,
        resultado_resumo: data ? {
          nome: data.basic?.name,
          cpf: data.basic?.cpf,
          idade: data.basic?.age,
          telefones: data.phones?.length || 0,
          emails: data.emails?.length || 0,
          enderecos: data.addresses?.length || 0,
        } : null,
      };

      console.log('📝 Salvando histórico via axios.post:', payload);

      await axios.post('/api/history', payload);
      console.log('✅ Histórico salvo com sucesso!');
      setHistorySaved(true);
    } catch (error) {
      console.error('❌ Erro ao salvar histórico:', error);
    }
  };

  const handleSearch = (newQuery, newModule, newToken) => {
    setHistorySaved(false);
    setPage(1);

    router.visit(`/consulta/${encodeURIComponent(newQuery)}`, {
      data: {
        module: newModule || module,
        token: newToken
      }
    });
  };

  const handleSelectPerson = (cpf) => {
    // Limpa CPF para garantir apenas números
    const cleanCpf = cpf.replace(/\D/g, '');
    // Inicia fluxo de verificação (precisa de novo token)
    setPendingCpf(cleanCpf);
  };

  const onTurnstileVerify = (token) => {
    if (pendingCpf) {
      handleSearch(pendingCpf, 'cpf', token);
      setPendingCpf(null);
    }
  };

  const handleExportPDF = async () => {
    if (!data || isList) return;

    setExporting(true);
    try {
      const pdf = generateProfessionalPDF(data, decodedQuery, module);
      const fileName = `consulta-${decodedQuery}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error('Erro ao exportar PDF');
    } finally {
      setExporting(false);
    }
  };

  if (error) {
    return (
      <>
        <Head title="Busca" />
        <Layout>
          <div className="max-w-4xl mx-auto py-12 text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Busca Falhou</h2>
            <p className="text-muted-foreground">Nao foi possivel localizar dados para "{decodedQuery}".</p>
            <button
              onClick={() => router.visit("/dashboard")}
              className="text-primary hover:underline underline-offset-4"
            >
              Voltar para Dashboard
            </button>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head title={`Consulta: ${decodedQuery}`} />
      <Layout>
        {/* Modal de Verificação Turnstile */}
        {pendingCpf && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card p-8 rounded-2xl shadow-2xl border border-border max-w-sm w-full space-y-6 text-center animate-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Verificando segurança</h3>
                <p className="text-sm text-muted-foreground">Por favor, aguarde a verificação para acessar os detalhes.</p>
              </div>
              <div className="flex justify-center">
                <Turnstile
                  sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                  onVerify={onTurnstileVerify}
                  theme="auto"
                />
              </div>
              <button
                onClick={() => setPendingCpf(null)}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b border-border">
            <button
              onClick={() => router.visit("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <div className="p-1 rounded-md bg-muted group-hover:bg-muted/80">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Voltar</span>
            </button>

            <div className="w-full sm:w-auto sm:flex-1 sm:max-w-md flex flex-col gap-4">
              <SearchInput
                onSearch={handleSearch}
                initialValue={decodedQuery}
                initialModule={module}
                isLoading={isLoading}
                compact
              />

              {/* FILTROS AVANÇADOS (Apenas para busca por Nome) */}
              {module === 'nome' && (
                <div className="flex flex-col sm:flex-row gap-2 animate-in fade-in slide-in-from-top-2 items-center">
                  <input
                    type="text"
                    placeholder="Nome da Mãe (Opcional)"
                    value={yearFilter} // Usando yearFilter como prop temporaria para evitar refactor massivo de estado agora, mas idealmente renomear estados
                    onChange={(e) => {
                      setYearFilter(e.target.value); // Reusando setYearFilter para motherName
                      setPage(1);
                    }}
                    className="w-full flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <label className="flex items-center gap-2 cursor-pointer bg-background border border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors">
                    <input
                      type="checkbox"
                      checked={ufFilter === 'true'} // Reusando ufFilter como booleano string
                      onChange={(e) => {
                        setUfFilter(e.target.checked ? 'true' : '');
                        setPage(1);
                      }}
                      className="rounded border-border bg-muted text-primary focus:ring-primary/50"
                    />
                    <span className="text-sm text-foreground select-none">Nome Exato</span>
                  </label>
                </div>
              )}

            </div>

            {data && !isList && (
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                title="Exportar resultado como PDF"
              >
                {exporting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Exportando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Exportar PDF</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* VISUALIZAÇÃO EM LISTA (Resultados Multiplos) */}
          {isList && Array.isArray(data) && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Encontrados {searchResult.pagination?.total || data.length} resultados
                </h2>
                <span className="text-sm text-muted-foreground">Mostrando {data.length} resultados</span>
              </div>

              <div className="grid gap-4">
                {data.map((pessoa, i) => (
                  <div key={i} className="group p-5 bg-card hover:bg-muted/50 border border-border hover:border-primary/50 rounded-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                    <div className="relative flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {pessoa.basic.name}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            CPF: {pessoa.basic.cpf}
                          </span>
                          {pessoa.basic.birthDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Nasc: {pessoa.basic.birthDate} ({pessoa.basic.age} anos)
                            </span>
                          )}
                          {pessoa.addresses?.[0] && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {pessoa.addresses[0].city}/{pessoa.addresses[0].state}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectPerson(pessoa.basic.cpf)}
                        className="w-full md:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {searchResult.pagination && searchResult.pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-border">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={searchResult.pagination.current_page === 1}
                    className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Página <span className="text-foreground font-medium">{searchResult.pagination.current_page}</span> de <span className="text-foreground font-medium">{searchResult.pagination.last_page}</span>
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(searchResult.pagination.last_page, p + 1))}
                    disabled={searchResult.pagination.current_page === searchResult.pagination.last_page}
                    className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VISUALIZAÇÃO DE PERFIL ÚNICO */}
          {!isList && (
            <>
              <ProfileHeader data={data} isLoading={isLoading} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {(data?.score || isLoading) && (
                  <InfoCard title="Score" icon={<TrendingUp className="w-4 h-4" />} loading={isLoading} className="lg:col-span-1">
                    {data?.score && (
                      <>
                        <DataRow
                          label="CSB8"
                          value={data.score.csb8?.toString()}
                          subValue={data.score.csb8_faixa ? `Faixa: ${data.score.csb8_faixa}` : undefined}
                        />
                        <DataRow
                          label="CSBA"
                          value={data.score.csba?.toString()}
                          subValue={data.score.csba_faixa ? `Faixa: ${data.score.csba_faixa}` : undefined}
                        />
                      </>
                    )}
                  </InfoCard>
                )}

                {(data?.poder_aquisitivo || isLoading) && (
                  <InfoCard title="Poder Aquisitivo" icon={<Wallet className="w-4 h-4" />} loading={isLoading} className="lg:col-span-1">
                    {data?.poder_aquisitivo && (
                      <>
                        <DataRow
                          label="Classificacao"
                          value={data.poder_aquisitivo.descricao}
                        />
                        <DataRow
                          label="Renda Estimada"
                          value={(() => {
                            let val = data.poder_aquisitivo.renda;
                            if (val === null || val === undefined) return '-';
                            // Se for string com virgula, troca por ponto para converter
                            if (typeof val === 'string') val = val.replace(',', '.');
                            const num = parseFloat(val);

                            if (isNaN(num)) return data.poder_aquisitivo.renda; // Retorna original se falhar
                            return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                          })()}
                        />
                        <DataRow
                          label="Faixa"
                          // Replace agressivo para corrigir 'at' seguido de lixo (at, at?, etc)
                          value={data.poder_aquisitivo.faixa?.replace(/at.?.?.?R\$/i, 'até R$')}
                        />
                      </>
                    )}
                  </InfoCard>
                )}

                {(data?.tse || isLoading) && (
                  <InfoCard title="Dados Eleitorais (TSE)" icon={<Vote className="w-4 h-4" />} loading={isLoading} className="lg:col-span-1">
                    {data?.tse && (
                      <>
                        <DataRow
                          label="Titulo de Eleitor"
                          value={data.tse.titulo_eleitor}
                          copyable
                        />
                        <DataRow
                          label="Zona"
                          value={data.tse.zona}
                        />
                        <DataRow
                          label="Secao"
                          value={data.tse.secao}
                        />
                      </>
                    )}
                  </InfoCard>
                )}

                {(data?.pis || isLoading) && (
                  <InfoCard title="PIS" icon={<CreditCard className="w-4 h-4" />} loading={isLoading} className="lg:col-span-1">
                    {data?.pis && (
                      <DataRow
                        label="Numero PIS"
                        value={data.pis.numero}
                        copyable
                      />
                    )}
                  </InfoCard>
                )}

                <InfoCard title="Enderecos" icon={<MapPin className="w-4 h-4" />} loading={isLoading} className="lg:col-span-1">
                  {data?.addresses?.map((addr, i) => (
                    <DataRow
                      key={i}
                      value={`${addr.street}, ${addr.zip}`}
                      subValue={`${addr.district} - ${addr.city}/${addr.state}`}
                      badge={addr.type}
                      copyable
                    />
                  ))}
                </InfoCard>

                <InfoCard title="Contatos" icon={<Phone className="w-4 h-4" />} loading={isLoading} className="lg:col-span-1">
                  {data?.phones?.map((phone, i) => (
                    <DataRow
                      key={`phone-${i}`}
                      label="TELEFONE"
                      value={phone.number}
                      subValue={phone.carrier}
                      badge={phone.active ? "ATIVO" : "INATIVO"}
                      copyable
                    />
                  ))}
                  {data?.phones && data?.emails && <div className="h-px bg-border my-2"></div>}
                  {data?.emails?.map((email, i) => (
                    <DataRow
                      key={`email-${i}`}
                      label="EMAIL"
                      value={email.address}
                      badge={email.type}
                      copyable
                    />
                  ))}
                </InfoCard>

                <InfoCard title="Vinculos" icon={<Briefcase className="w-4 h-4" />} loading={isLoading} className="lg:col-span-1">
                  {data?.jobs?.map((job, i) => (
                    <DataRow
                      key={i}
                      value={job.company}
                      subValue={job.role}
                      badge={job.active ? "ATUAL" : `${job.admission?.slice(-4) || ''} - ${job.exit ? job.exit.slice(-4) : "ATUAL"}`}
                    />
                  ))}
                </InfoCard>

                <InfoCard title="Relacionamentos" icon={<Users className="w-4 h-4" />} loading={isLoading} className="md:col-span-2 lg:col-span-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {data?.relations?.map((rel, i) => (
                      <DataRow
                        key={i}
                        label={rel.type}
                        value={rel.name}
                        subValue={`CPF: ${rel.cpf}`}
                        copyable
                      />
                    ))}
                  </div>
                </InfoCard>

              </div>
            </>
          )}

        </div >
      </Layout >
    </>
  );
}
