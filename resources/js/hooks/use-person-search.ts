import { useQuery } from "@tanstack/react-query";
import { consultaService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { router } from "@inertiajs/react";

export function usePersonSearch(query: string, tipo: string = 'cpf', page: number = 1, filtros: { nome_mae?: string, exato?: boolean } = {}, token?: string) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['person', query, tipo, page, filtros.nome_mae, filtros.exato, token],
    queryFn: async () => {
      try {
        const result = await consultaService.buscar(query, tipo, page, filtros, token);
        return result;
      } catch (error: any) {
        if (error.response?.status === 404) {
          toast({
            title: "Nao encontrado",
            description: "Nenhum registro encontrado para esta busca.",
            variant: "destructive"
          });
          throw error;
        }
        if (error.response?.status === 401) {
          router.visit('/login');
          throw error;
        }

        if (error.response?.status === 403) {
          const data = error.response?.data;
          if (data?.error === 'NO_SUBSCRIPTION' || data?.error === 'SUBSCRIPTION_EXPIRED' || data?.error === 'LIMIT_EXCEEDED' || data?.message) {
            toast({
              title: "Assinatura Necessaria",
              description: data?.message || "Escolha um plano para continuar.",
              variant: "destructive",
              duration: 4000
            });

            // Redirecionar para planos
            setTimeout(() => router.visit('/plans'), 1000);
            throw error;
          }
        }
        toast({
          title: "Erro na busca",
          description: error.response?.data?.message || "Falha ao consultar a API.",
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
    retry: false
  });
}
