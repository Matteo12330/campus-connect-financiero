# CampusConnect 360 — Frontend (Portal Financiero / Pagos)

Contexto para quien trabaje en este repo. El backend es .NET, vive en otro repo
(`campus-connect`) y **no se modifica desde aquí**. La base visual y técnica está
consolidada en `src/shared/` — reutilízala, no la dupliques ni cambies su identidad.

## Qué es este repo

Frontend del **Portal Financiero / Pagos** (rol JWT `Finanzas`, usuario de prueba
`finanzas1 / Admin1234!`). Es uno de los 3 portales de CampusConnect 360; todos comparten
la misma base de diseño definida por el Portal Docente:

| Portal | Rol JWT | Usuario de prueba |
|---|---|---|
| Docente / Bienestar | `Docente` | docente1 / Admin1234! |
| Académico / Secretaría | `Secretaria` | secretaria1 / Admin1234! |
| Financiero / Pagos (este) | `Finanzas` | finanzas1 / Admin1234! |

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 (tokens propios) · TanStack Query · React Hook
Form + Zod · React Router 7 · react-day-picker · motion.

## Cómo correr

1. Backend arriba (desde el repo `campus-connect`):
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.local.yml --profile services up -d --build
   ```
   Este portal necesita **identity**, **academic**, **payments** y **gateway**.
2. Frontend:
   ```bash
   npm install
   cp .env.example .env   # VITE_GATEWAY_URL: 8080 (docker) o 5287 (dotnet run)
   npm run dev            # http://localhost:5173
   ```

Scripts: `npm run dev` · `npm run build` · `npm run preview` · `npm run lint` (oxlint).

## Integración con el backend (CRÍTICO)

- El frontend habla **SIEMPRE con el API Gateway**, nunca con los microservicios directo.
- **El backend NO tiene CORS.** Se resuelve con el **proxy del dev server** (`vite.config.ts`
  reenvía `/api` → Gateway). No se modifica el backend.
- Toda request lleva `Authorization: Bearer` (si hay sesión) y `X-Correlation-Id`.
  Ante 401, el cliente intenta refresh una vez (ver `src/shared/api/httpClient.ts`).
- Los IDs de estudiante y de obligación son **ULID de 26 caracteres**: se **eligen de una
  lista**, nunca se tipean.
- La lista de estudiantes de Payments es una **réplica local** que se llena con los eventos
  `StudentEnrolled` / `StudentStatusUpdated` (los publica Academic). Arranca vacía.

## Dominio: obligaciones de pago

El modelo del backend NO es "pagos" sueltos — es **obligación → confirmación**:

1. `POST /api/payments/obligations` crea un cobro con estado `Pending`
   (`{studentId, concept, amount, dueDate}`).
2. `POST /api/payments/obligations/{id}/confirm` registra el pago
   (`{method, reference}` — ambos obligatorios) y publica el evento **`PaymentConfirmed`**
   vía outbox → RabbitMQ. Academic lo consume y actualiza el `financialStatus` del estudiante.
3. Estados de obligación: solo `Pending` y `Confirmed`. Confirmar dos veces → 409.
4. `financialStatus` del estudiante (réplica): `Pending` / `Paid` / `Overdue`
   (puede ser `null` en réplicas viejas).

## Endpoints que consume este portal (vía Gateway)

| Acción | Método y ruta | Rol |
|---|---|---|
| Login | `POST /api/identity/auth/login` | público |
| Refresh | `POST /api/identity/auth/refresh` | público |
| Listar estudiantes | `GET /api/payments/students?page&pageSize&grade&search` → `{items, total}` | Finanzas |
| Registrar obligación | `POST /api/payments/obligations` | Finanzas |
| Listar obligaciones | `GET /api/payments/obligations?status=` | Finanzas |
| Detalle de obligación | `GET /api/payments/obligations/{id}` (incluye `payment` si fue pagada) | Finanzas |
| Confirmar pago | `POST /api/payments/obligations/{id}/confirm` | Finanzas |
| Health | `GET /api/payments/health` | público |

**NO inventar endpoints**: `/payments/records`, `/payments/students/{id}` y
`/payments/students/{id}/status` NO existen. Los tipos de `src/types/api.ts` reflejan los
DTO reales del backend — verificar contra el código .NET antes de agregar campos.

## Arquitectura del código

```
src/
├─ app/        router + providers (QueryClient, Auth, Toast, MotionConfig)
├─ shared/     ◄── BASE REUTILIZABLE — no la dupliques, impórtala
│  ├─ ui/      Button, Field, Card, Badge, Spinner, EmptyState, PageHeader,
│  │           DatePicker, Reveal, pills, toast/useToast
│  ├─ layout/  AppShell, TopBar (barra vino), NavTabs (regla dorada)
│  ├─ api/     httpClient (Bearer + X-Correlation-Id + refresh) · useHealth
│  ├─ auth/    AuthContext, useAuth, RoleGuard, authStorage
│  ├─ lib/     utilidades (initials, today, formatMoney — USD es-EC)
│  └─ styles/  tokens.css (variables UDLA + theming de react-day-picker)
├─ features/   ◄── ESPECÍFICO de este portal
│  ├─ auth/ · obligations/ · students/
└─ types/      contratos del backend (DTOs)
```

Alias de import: `@/` → `src/` (ej. `import { Button } from '@/shared/ui/Button'`).

## Identidad visual (NO la cambies, respétala)

- **Paleta** (en `tokens.css` como tokens de Tailwind): `vino` `#7A1B2E` (primario),
  `vino-dark`, `oro` `#B0892F` (acento), `ink`, `muted`, `line`, `panel`, y estados
  `present`/`absent`/`late` con sus `-bg`/`-ink`. Usa `bg-vino`, `text-oro`, etc.
- **NO introducir otras paletas** (verde, azul, etc.) ni estilos inline con hex
  hardcodeados. Los hovers van con clases Tailwind, no con `onMouseEnter`.
- **Tipografías**: `font-display` (Spectral, serif) para títulos/marca; `font-sans` (Inter)
  para todo lo operativo. Cargadas en `index.html`.
- **Elemento firma**: la **regla dorada** bajo cada título → usa `<PageHeader title subtitle />`.
- **Escala**: base 18px (en `tokens.css`). Tamaños en `rem` para que todo escale parejo.
- **Sombras**: `shadow-card` (tarjetas) y `shadow-pop` (popovers).
- **Movimiento**: entrada de secciones con `<Reveal>`, filas con stagger, modales con
  `AnimatePresence`. `MotionConfig reducedMotion="user"` ya respeta accesibilidad.
- **Idioma**: UI en español neutro (sin voseo), sentence case, copy claro.

## Cómo agregar una pantalla nueva

1. Crea `src/features/<area>/` con tus páginas y hooks.
2. Datos de servidor con TanStack Query (`useQuery`/`useMutation`) sobre `apiFetch` del
   `httpClient`. Define los DTOs en `src/types/api.ts` (verificados contra el backend).
3. Formularios con React Hook Form + Zod (`Field` + `controlClass`/`textareaClass`).
4. Reutiliza `PageHeader`, `Card`, `Button`, `EmptyState`, `Spinner`, `DatePicker`, etc.
5. Registra las rutas en `src/app/router.tsx` dentro del `<RoleGuard allow={['Finanzas']}>`.
6. Maneja los 3 estados siempre: loading (`Spinner`), error y vacío (`EmptyState`).

## Gotchas de TypeScript (config del scaffold)

- `verbatimModuleSyntax: true` → importa tipos con `import type { … }`.
- `erasableSyntaxOnly: true` → **no uses `enum`**; usa uniones de string (`'A' | 'B'`).
- `noUnusedLocals/Parameters` → no dejes imports ni variables sin usar.
- Montos: el form los maneja como `string` y los convierte con `Number()` al enviar
  (evita el cast `as Resolver<...>` con `z.coerce`).

## Convenciones de git

- Conventional commits, **sin atribución de IA / Co-Authored-By**.
- Rama de trabajo: `main`.
