// Contratos del backend CampusConnect 360 (serialización camelCase de System.Text.Json).
// Estos tipos reflejan los DTO reales de Identity y Payments — no inventar campos.

export type UserRole = 'Secretaria' | 'Finanzas' | 'Docente' | 'Direccion'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  role: UserRole
  fullName: string
}

export interface CurrentUser {
  userId: string
  username: string
  fullName: string
  role: UserRole
}

// ── Payments: réplica local de estudiantes ──
// Se llena con los eventos StudentEnrolled / StudentStatusUpdated que publica Academic.

export interface StudentReplicaItemDto {
  studentId: string
  fullName: string
  grade: string
  schoolId: string
  lastUpdatedAt: string
  // Pueden venir null en réplicas creadas antes de la fase 3 del backend.
  academicStatus: string | null
  financialStatus: string | null
}

export interface PagedList<T> {
  items: T[]
  total: number
}

// ── Payments: obligaciones de pago ──
// Flujo: se registra una obligación (Pending) y luego se confirma el pago,
// lo que publica el evento PaymentConfirmed vía outbox.

export type ObligationStatus = 'Pending' | 'Confirmed'

export interface ObligationListItemDto {
  obligationId: string
  studentId: string
  concept: string
  amount: number
  dueDate: string
  status: ObligationStatus
}

export interface PaymentDto {
  paymentId: string
  method: string
  reference: string
  confirmedAt: string
}

export interface ObligationDetailDto {
  obligationId: string
  studentId: string
  concept: string
  amount: number
  dueDate: string
  schoolId: string
  status: ObligationStatus
  payment: PaymentDto | null
}

export interface RegisterObligationRequest {
  studentId: string
  concept: string
  amount: number
  dueDate: string
}

export interface RegisterObligationResponse {
  obligationId: string
  status: string
}

export interface ConfirmPaymentRequest {
  method: string
  reference: string
}

export interface ConfirmPaymentResponse {
  obligationId: string
  status: string
  paymentId: string
  confirmedAt: string
}
