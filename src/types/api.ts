// Contratos del backend CampusConnect 360 (serialización camelCase de System.Text.Json).
// Estos tipos reflejan los DTO reales de Identity y Attendance — no inventar campos.

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

export interface StudentReplica {
  studentId: string
  fullName: string
  grade: string
  schoolId: string
  lastUpdatedAt: string
}

export interface StudentReplicaItemDto {
  studentId: string
  fullName: string
  grade: string
  schoolId: string
  lastUpdatedAt: string
  academicStatus: string
  financialStatus: string
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late'

export interface AttendanceRecordDto {
  recordId: string
  studentId: string
  date: string
  status: AttendanceStatus
}

export type IncidentSeverity = 'Low' | 'Medium' | 'High'

export interface IncidentSummary {
  incidentId: string
  studentId: string
  type: string
  severity: IncidentSeverity
}

export interface StudentHistory {
  attendance: AttendanceRecordDto[]
  incidents: IncidentSummary[]
}

export interface RecordAttendanceResponse {
  recordId: string
  status: string
}

export interface ReportIncidentResponse {
  incidentId: string
  severity: string
}

// ── Academic (Portal Secretaría / Académico) ──

export interface StudentListItemDto {
  studentId: string
  fullName: string
  grade: string
  academicStatus: string
  financialStatus: string
}

export interface StudentDetailDto {
  studentId: string
  fullName: string
  documentId: string
  grade: string
  schoolId: string
  academicStatus: string
  financialStatus: string
  guardian: GuardianDto
}

export interface GuardianDto {
  name: string
  email: string
}

export interface EnrollStudentRequest {
  fullName: string
  documentId: string
  grade: string
  schoolId?: string
  guardianName: string
  guardianEmail: string
}

export interface EnrollStudentResponse {
  studentId: string
  enrollmentId: string
  status: string
}

export interface StudentStatusDto {
  studentId: string
  exists: boolean
  academicStatus: string
  financialStatus: string
}

export interface PaymentRecordDto {
  paymentId: string
  studentId: string
  paymentType: string
  description: string
  amount: number
  paymentDate: string
  status: 'Pending' | 'Confirmed' | 'Paid' | 'Overdue'
  createdAt: string
  confirmedAt?: string
}

export interface PaymentConfirmationResponse {
  paymentId: string
  status: 'Confirmed' | 'Paid'
  confirmedAt: string
}

export interface StudentEventDto {
  eventType: string
  occurredAt: string
  correlationId: string
}

export interface PagedList<T> {
  items: T[]
  total: number
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}
