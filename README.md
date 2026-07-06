# CampusConnect 360 — Portal Financiero / Pagos

Frontend del **Portal Financiero / Pagos** de CampusConnect 360. Gestiona obligaciones,
consultas de estado y pagos de estudiantes a través del **API Gateway**.

> Repositorio independiente del backend. Este fork sirve solo el portal Financiero; los
demás frontends viven en sus propios repositorios y despliegues.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 con tokens propios (identidad UDLA: vino + oro)
- TanStack Query (estado de servidor) · React Hook Form + Zod (formularios)
- React Router 7

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

Esto levanta Postgres + RabbitMQ + los 6 microservicios + Gateway (8080). Para este portal
alcanza con que estén arriba **identity**, **academic** (para matricular y poblar la réplica)
y **gateway**, pero el compose los trae a todos.

## Cómo ejecutar el frontend

```bash
npm install
cp .env.example .env   # default 8080 (docker); pon 5287 si corres el backend con dotnet run
npm run dev
```

Abre http://localhost:5173.

### Usuario de prueba

| Usuario      | Contraseña  | Rol        |
| ------------ | ----------- | ---------- |
| finanzas1    | Admin1234!  | Finanzas  |

> El portal exige rol **Finanzas**. Otros roles ven una pantalla de
> "sin acceso".

### Importante: lista de estudiantes

La lista de estudiantes la expone el servicio de Pagos vía Gateway. Si la lista está
vacía, revisa que el backend de Pagos esté arriba y que el Gateway tenga las rutas
`/api/payments/students` y `/api/payments/obligations` correctamente mapeadas.

## CORS / proxy

El backend no expone CORS. El dev server de Vite hace **proxy** de `/api` hacia el Gateway
(ver `vite.config.ts`), así el navegador siempre ve el mismo origen. No se modifica el backend.

## Estructura

```
src/
├─ app/         router + providers (QueryClient, Auth, Toast)
├─ shared/      base reutilizable del portal
│  ├─ ui/       Button, Field, Card, Badge, Spinner, EmptyState, PageHeader,
│  │            SegmentedControl, pills, toast
│  ├─ layout/   AppShell, TopBar (barra vino), NavTabs (regla dorada)
│  ├─ api/      httpClient (Bearer + X-Correlation-Id + refresh) · useHealth
│  ├─ auth/     AuthContext, useAuth, RoleGuard, authStorage
│  ├─ lib/      utilidades (initials, today)
│  └─ styles/   tokens.css (variables UDLA)
├─ features/    módulos del portal Académico / Secretaría
│  ├─ auth/         LoginPage
│  ├─ secretaria/   matrícula, listado y ficha de estudiantes
│  ├─ attendance/   AttendancePage (si aplica en este fork)
│  └─ incidents/    IncidentsPage (si aplica en este fork)
└─ types/       contratos del backend (DTOs)
```

## Endpoints que consume (vía Gateway)

| Acción                         | Método y ruta                               | Rol        |
| ------------------------------ | ------------------------------------------- | ---------- |
| Login                          | `POST /api/identity/auth/login`             | público    |
| Refresh token                  | `POST /api/identity/auth/refresh`           | público    |
| Listar estudiantes financieros | `GET /api/payments/students`                | Finanzas   |
| Registrar obligación de pago   | `POST /api/payments/obligations`            | Finanzas   |
| Detalle de estudiante          | `GET /api/payments/students/{id}`           | Finanzas   |
| Estado financiero              | `GET /api/payments/students/{id}/status`    | Finanzas   |
| Health                         | `GET /api/payments/health`                  | público    |

Este portal consume el servicio de Pagos y la información financiera de estudiantes
vía Gateway.

## Estructura de rutas

- `/login` es la pantalla de acceso.
- `/` es la vista principal de matrícula.
- `/estudiantes` muestra el listado.
- `/estudiantes/:studentId` muestra la ficha del estudiante.

## Cómo reutilizar la base

Todo lo de `src/shared/` es reutilizable dentro de este portal: mantené los tokens de
`tokens.css`, usa `PageHeader` (regla dorada), `AppShell` y el `httpClient`.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — compila para producción
- `npm run preview` — sirve el build
- `npm run lint` — oxlint
