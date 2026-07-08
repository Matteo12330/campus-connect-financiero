# CampusConnect 360 — Portal Financiero / Pagos

Frontend del **Portal Financiero / Pagos** de CampusConnect 360. Permite al personal de
finanzas registrar obligaciones de pago (matrícula, mensualidad, etc.), confirmar los pagos
recibidos y consultar el estado financiero de los estudiantes. Consume el backend de
microservicios (.NET) a través del **API Gateway**.

> Repositorio independiente del backend. Hereda la **base de diseño reutilizable**
> (tokens, componentes, layout, cliente HTTP, auth) definida por el Portal Docente.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 con tokens propios (identidad UDLA: vino + oro)
- TanStack Query (estado de servidor) · React Hook Form + Zod (formularios)
- React Router 7 · react-day-picker (calendarios) · motion (animaciones)

## Requisitos previos

1. Backend de CampusConnect 360 corriendo (microservicios + Gateway).
2. Infra en Docker: Postgres y RabbitMQ arriba.
3. Node 20+.

El backend es **.NET** (no Spring Boot). El Gateway debe estar accesible:
`http://localhost:8080` con docker compose (modo demo, default) u `http://localhost:5287`
con `dotnet run` local.

## Levantar el backend (modo demo, docker compose)

Desde el repo del backend (`campus-connect`):

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml --profile services up -d --build
```

Para este portal deben estar arriba **identity**, **academic** (para matricular y poblar la
réplica), **payments** y **gateway**.

## Cómo ejecutar el frontend

```bash
npm install
cp .env.example .env   # default 8080 (docker); pon 5287 si corres el backend con dotnet run
npm run dev
```

Abre http://localhost:5173.

### Usuario de prueba

| Usuario   | Contraseña  | Rol      |
| --------- | ----------- | -------- |
| finanzas1 | Admin1234!  | Finanzas |

> El portal exige rol **Finanzas**. Otros roles ven una pantalla de "sin acceso".

### Importante: lista de estudiantes

La lista de estudiantes es una **réplica local** que el servicio de Payments llena al
consumir los eventos `StudentEnrolled` / `StudentStatusUpdated` que publica el servicio
Académico. Si la lista está vacía, es porque todavía **no se matriculó ningún estudiante**
desde Secretaría/Academic.

## Flujo de negocio del portal

1. **Registrar obligación** — se crea un cobro (`Pending`) para un estudiante:
   `POST /api/payments/obligations`.
2. **Confirmar pago** — se registra el pago con método y referencia:
   `POST /api/payments/obligations/{id}/confirm`. El backend publica el evento
   **`PaymentConfirmed`** (outbox → RabbitMQ) y Academic actualiza el estado financiero
   del estudiante.
3. **Consultar** — lista y detalle de obligaciones, y réplica de estudiantes con su
   estado financiero/académico.

## CORS / proxy

El backend no expone CORS. El dev server de Vite hace **proxy** de `/api` hacia el Gateway
(ver `vite.config.ts`), así el navegador siempre ve el mismo origen. No se modifica el backend.

## Estructura

```
src/
├─ app/           router + providers (QueryClient, Auth, Toast, MotionConfig)
├─ shared/        BASE REUTILIZABLE por los 3 portales (no cambiar la identidad visual)
│  ├─ ui/         Button, Field, Card, Badge, Spinner, EmptyState, PageHeader,
│  │              DatePicker, Reveal, pills, toast
│  ├─ layout/     AppShell, TopBar (barra vino), NavTabs (regla dorada)
│  ├─ api/        httpClient (Bearer + X-Correlation-Id + refresh) · useHealth
│  ├─ auth/       AuthContext, useAuth, RoleGuard, authStorage
│  ├─ lib/        utilidades (initials, today, formatMoney)
│  └─ styles/     tokens.css (variables UDLA)
├─ features/      ESPECÍFICO del Portal Financiero
│  ├─ auth/          LoginPage
│  ├─ obligations/   ObligationsPage (lista + detalle + confirmar pago),
│  │                 RegisterObligationPage, ConfirmPaymentDialog
│  └─ students/      StudentsPage (réplica paginada con estados)
└─ types/         contratos del backend (DTOs reales de Payments)
```

## Endpoints que consume (vía Gateway)

| Acción                 | Método y ruta                                     | Rol      |
| ---------------------- | ------------------------------------------------- | -------- |
| Login                  | `POST /api/identity/auth/login`                   | público  |
| Refresh token          | `POST /api/identity/auth/refresh`                 | público  |
| Listar estudiantes     | `GET /api/payments/students?page&pageSize&search` | Finanzas |
| Registrar obligación   | `POST /api/payments/obligations`                  | Finanzas |
| Listar obligaciones    | `GET /api/payments/obligations?status=`           | Finanzas |
| Detalle de obligación  | `GET /api/payments/obligations/{id}`              | Finanzas |
| Confirmar pago         | `POST /api/payments/obligations/{id}/confirm`     | Finanzas |
| Health                 | `GET /api/payments/health`                        | público  |

- Estados de obligación: `Pending` / `Confirmed` (no hay otros).
- `GET /payments/students` devuelve `{ items, total }` (paginación del servidor).
- Confirmar pago requiere body `{ method, reference }`.
- Confirmar publica `PaymentConfirmed`; el frontend solo dispara la acción — la mensajería
  la maneja el backend.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — compila para producción
- `npm run preview` — sirve el build
- `npm run lint` — oxlint
