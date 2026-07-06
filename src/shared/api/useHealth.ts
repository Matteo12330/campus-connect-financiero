import { useQuery } from '@tanstack/react-query'

// Health check del ecosistema vía Gateway (ruta pública, sin Bearer).
// Alimenta el indicador "En línea" de la barra superior (observabilidad).
export function useHealth(): boolean {
  const { data } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch('/api/payments/health')
      return res.ok
    },
    refetchInterval: 15000,
    staleTime: 10000,
  })
  return data ?? false
}
