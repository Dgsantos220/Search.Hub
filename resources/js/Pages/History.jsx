import { Head, router } from "@inertiajs/react";
import { Layout } from "@/Components/layout";
import { History, Search, Calendar, ChevronRight, Trash2, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export default function HistoryPage({ history }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [clearing, setClearing] = useState(false);
  const [historyList, setHistoryList] = useState(history?.data || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(history?.has_more ?? false);
  const [nextCursor, setNextCursor] = useState(history?.next_cursor || null);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  useEffect(() => {
    setHistoryList(history?.data || []);
    setHasMore(history?.has_more ?? false);
    setNextCursor(history?.next_cursor || null);
  }, [history]);

  const filteredHistory = historyList.filter(h =>
    h.query?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !nextCursor) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/history?cursor=${encodeURIComponent(nextCursor)}&per_page=20`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setHistoryList(prev => [...prev, ...data.data]);
        setHasMore(data.has_more);
        setNextCursor(data.next_cursor);
      }
    } catch (error) {
      console.error('Erro ao carregar mais:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, nextCursor]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading]);

  const handleClearHistory = () => {
    if (!confirm('Tem certeza que deseja limpar todo o historico?')) return;
    setClearing(true);

    router.delete('/history', {
      onSuccess: () => {
        toast.success('Historico limpo com sucesso');
        setHistoryList([]);
        setHasMore(false);
        setNextCursor(null);
      },
      onError: () => toast.error('Erro ao limpar historico'),
      onFinish: () => setClearing(false),
    });
  };

  const handleDeleteItem = (id) => {
    router.delete(`/history/${id}`, {
      onSuccess: () => {
        toast.success('Registro removido');
        setHistoryList(prev => prev.filter(h => h.id !== id));
      },
      onError: () => toast.error('Erro ao remover registro'),
    });
  };

  const getTypeColor = (tipo) => {
    const colors = {
      cpf: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      telefone: 'text-green-400 bg-green-500/10 border-green-500/20',
      email: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      nome: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      rg: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      parentes: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    };
    return colors[tipo] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  return (
    <>
      <Head title="Historico" />
      <Layout>
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Log de Auditoria</h1>
              <p className="text-muted-foreground font-mono mt-1">HISTORICO DE BUSCAS & LOGS DE ACESSO</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-full md:w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filtrar logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
              {historyList.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  disabled={clearing}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  title="Limpar historico"
                >
                  {clearing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <History className="w-4 h-4" />
            <span>{filteredHistory.length} registros carregados</span>
            {hasMore && <span className="text-primary">(mais disponiveis)</span>}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-mono text-muted-foreground uppercase tracking-wider bg-muted/40">
              <div className="col-span-4 md:col-span-4">Termo Pesquisado</div>
              <div className="col-span-3 md:col-span-2">Tipo</div>
              <div className="col-span-3 md:col-span-3">Data/Hora</div>
              <div className="col-span-2 md:col-span-2 text-center">Status</div>
              <div className="col-span-1 text-right">Acao</div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                Nenhum registro encontrado
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredHistory.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors group">
                    <div className="col-span-4 md:col-span-4 font-mono text-foreground text-sm truncate flex items-center gap-2">
                      <History className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{log.query}</span>
                    </div>

                    <div className="col-span-3 md:col-span-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-mono uppercase ${getTypeColor(log.tipo)}`}>
                        {log.tipo}
                      </span>
                    </div>

                    <div className="col-span-3 md:col-span-3 flex flex-col text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {log.created_at}
                      </div>
                      {log.created_at_relative && (
                        <span className="text-[10px] text-primary/60">{log.created_at_relative}</span>
                      )}
                    </div>

                    <div className="col-span-2 md:col-span-2 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${log.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {log.success ? 'SUCESSO' : 'FALHA'}
                      </span>
                    </div>

                    <div className="col-span-1 flex justify-end gap-1">
                      <button
                        onClick={() => handleDeleteItem(log.id)}
                        className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all"
                        title="Remover"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => router.visit(`/consulta/${encodeURIComponent(log.query)}?module=${log.tipo || 'cpf'}`)}
                        className="p-1.5 rounded-md hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                        title="Refazer consulta"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasMore && (
              <div ref={loadingRef} className="flex items-center justify-center py-6 border-t border-border">
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Carregando mais...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadMore}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Carregar mais
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
