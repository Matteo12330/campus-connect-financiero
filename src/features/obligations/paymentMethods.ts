// El backend valida method contra estos valores exactos: Cash, Transfer, Card.
// La UI muestra la etiqueta en español pero envía el valor del contrato.
export const METHOD_OPTIONS = [
  { value: 'Cash', label: 'Efectivo' },
  { value: 'Transfer', label: 'Transferencia' },
  { value: 'Card', label: 'Tarjeta' },
] as const

const labels: Record<string, string> = Object.fromEntries(
  METHOD_OPTIONS.map((m) => [m.value, m.label]),
)

export function methodLabel(method: string): string {
  return labels[method] ?? method
}
