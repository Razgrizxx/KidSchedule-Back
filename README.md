# KidSchedule API

Backend REST API para **KidSchedule**, una plataforma SaaS de coparentalidad y gestión familiar. Centraliza calendarios de custodia, gastos compartidos y comunicaciones con integridad legal entre padres, facilitando la coordinación del cuidado de los hijos.

## Características principales

- **Autenticación JWT** con verificación de teléfono (modo dev incluido)
- **Gestión familiar** con sistema de invitaciones por email
- **Calendario de custodia** con generación automática de eventos según 5 patrones de rotación
- **Mensajería inmutable** con cadena de hash SHA-256 para validez legal
- **Cuidadores** con visibilidad compartida/privada y permisos granulares
- **Solicitudes de cambio** con flujo de aprobación/rechazo/contrapropuesta
- **Gastos compartidos** con calculadora de balance entre padres
- **Galería de momentos** para compartir fotos de los hijos

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | NestJS (Node.js + TypeScript) |
| Base de datos | PostgreSQL |
| ORM | Prisma v7 |
| Autenticación | JWT + Passport |
| Validación | class-validator / class-transformer |

---

## Estructura del proyecto

```
src/
├── main.ts                         # Entrada, configuración global (pipes, filtros, CORS)
├── app.module.ts                   # Módulo raíz
│
├── prisma/                         # PrismaService (global)
│
├── common/
│   ├── guards/jwt-auth.guard.ts    # Guard JWT reutilizable
│   ├── decorators/current-user.ts  # Decorador @CurrentUser()
│   ├── filters/                    # Filtro global de excepciones
│   └── types/auth-user.ts          # Clase AuthUser para parámetros de controladores
│
├── auth/                           # Registro, login, verificación de teléfono
├── family/                         # CRUD de familias + invitaciones
├── children/                       # CRUD de hijos (con campo color para calendario)
├── caregivers/                     # Cuidadores con visibilidad y permisos
├── schedule/                       # Wizard de custodia + generador de eventos
├── messaging/                      # Mensajería inmutable con hash chain
├── requests/                       # Solicitudes de cambio de calendario
├── expenses/                       # Gastos compartidos y balance
└── moments/                        # Galería de fotos (metadatos)

prisma/
├── schema.prisma                   # Esquema completo de la base de datos
└── seed.ts                         # Usuario inicial: Christian Javier Rizzo

prisma.config.ts                    # Configuración de conexión a PostgreSQL (Prisma v7)
```

---

## Modelos de base de datos

```
User ─── FamilyMember ─── Family ─── Child
                               │         └── Schedule ─── CustodyEvent
                               │         └── Caregiver ─── ChildCaregiver
                               │
                               ├── Message          (hash chain SHA-256)
                               ├── ChangeRequest    (pending/accepted/declined/counter)
                               ├── Expense          (con splitRatio y balance)
                               └── Moment           (galería de fotos)
```

### Patrones de custodia soportados

| Patrón | Descripción |
|--------|-------------|
| `ALTERNATING_WEEKS` | Semanas alternas completas |
| `TWO_TWO_THREE` | 2 días / 2 días / 3 días rotando |
| `THREE_FOUR_FOUR_THREE` | 3-4-4-3 días por quincena |
| `FIVE_TWO_TWO_FIVE` | 5-2-2-5 días por quincena |
| `EVERY_OTHER_WEEKEND` | Fin de semana alterno (viernes a domingo) |

---

## Requisitos previos

- **Node.js** v18 o superior
- **PostgreSQL** v14 o superior corriendo localmente
- **npm** v9 o superior

---

## Instalación y puesta en marcha

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd kidSchedule
npm install
```

### 2. Configurar variables de entorno

Editar el archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres:christian_pg_2026!@localhost:5432/christian_db?schema=public"

JWT_SECRET="kidschedule-jwt-secret-2026-super-secure"
JWT_EXPIRES_IN="7d"

NODE_ENV="development"
PORT=3000

# En modo dev, la verificación de teléfono siempre devuelve el código "123456"
DEV_MODE=true
```

### 3. Crear la base de datos en PostgreSQL

```sql
-- Conectarse a PostgreSQL y ejecutar:
CREATE DATABASE christian_db;
```

### 4. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

Esto crea todas las tablas según el esquema definido en `prisma/schema.prisma`.

### 5. Cargar datos iniciales (seed)

```bash
npm run seed
```

Crea el usuario inicial:
- **Email:** `christian@kidschedule.app`
- **Password:** `Admin@2026!`

### 6. Iniciar el servidor

```bash
# Desarrollo (con hot-reload)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La API queda disponible en: `http://localhost:3000/api/v1`

---

## Endpoints principales

Todos los endpoints (excepto auth) requieren el header:
```
Authorization: Bearer <token>
```

### Autenticación
```
POST   /api/v1/auth/register          # Crear cuenta
POST   /api/v1/auth/login             # Iniciar sesión → devuelve JWT
POST   /api/v1/auth/phone/send        # Enviar código de verificación SMS
POST   /api/v1/auth/phone/verify      # Verificar código
```

### Familias
```
POST   /api/v1/families                           # Crear familia
GET    /api/v1/families                           # Listar mis familias
GET    /api/v1/families/:id                       # Ver familia
POST   /api/v1/families/:id/invite                # Invitar padre por email
POST   /api/v1/families/invitations/:token/accept # Aceptar invitación
```

### Hijos
```
POST   /api/v1/families/:familyId/children
GET    /api/v1/families/:familyId/children
PATCH  /api/v1/families/:familyId/children/:childId
DELETE /api/v1/families/:familyId/children/:childId
```

### Calendario de custodia
```
POST   /api/v1/families/:familyId/schedules                    # Crear patrón → genera eventos automáticamente
GET    /api/v1/families/:familyId/schedules                    # Listar patrones
GET    /api/v1/families/:familyId/schedules/calendar?year=&month=  # Vista mensual
POST   /api/v1/families/:familyId/schedules/:id/override       # Sobrescribir un día
```

### Mensajería
```
POST   /api/v1/families/:familyId/messages              # Enviar mensaje (inmutable)
GET    /api/v1/families/:familyId/messages              # Historial paginado
GET    /api/v1/families/:familyId/messages/verify-chain # Verificar integridad del hash chain
POST   /api/v1/families/:familyId/messages/mark-read
```

### Solicitudes de cambio
```
POST   /api/v1/families/:familyId/requests
GET    /api/v1/families/:familyId/requests
POST   /api/v1/families/:familyId/requests/:id/respond  # ACCEPTED | DECLINED | COUNTER_PROPOSED
```

### Gastos
```
POST   /api/v1/families/:familyId/expenses
GET    /api/v1/families/:familyId/expenses
GET    /api/v1/families/:familyId/expenses/balance      # Quién le debe a quién
PATCH  /api/v1/families/:familyId/expenses/:id
DELETE /api/v1/families/:familyId/expenses/:id
```

### Cuidadores
```
POST   /api/v1/families/:familyId/caregivers
GET    /api/v1/families/:familyId/caregivers            # Respeta visibilidad SHARED/PRIVATE
PATCH  /api/v1/families/:familyId/caregivers/:id
POST   /api/v1/families/:familyId/caregivers/:id/assign/:childId
GET    /api/v1/caregivers/invite/:token                 # Resolución pública de link de invitación
```

### Momentos
```
POST   /api/v1/families/:familyId/moments
GET    /api/v1/families/:familyId/moments?childId=      # Filtro opcional por hijo
DELETE /api/v1/families/:familyId/moments/:id
```

---

## Decisiones de arquitectura

### Segmentación por `familyId`
Todos los recursos están anidados bajo `/families/:familyId`. Cada endpoint verifica que el usuario autenticado sea miembro de esa familia antes de operar, garantizando aislamiento total entre familias.

### Mensajería con integridad legal
Los mensajes no pueden editarse ni eliminarse. Cada mensaje almacena:
```
contentHash = SHA256(content + timestamp + previousHash)
```
El primer mensaje usa `previousHash = "0"`. Esto forma una cadena verificable que detecta cualquier manipulación retroactiva del historial.

### Generación de eventos de custodia
Al crear un `Schedule`, el `ScheduleGeneratorService` genera automáticamente un registro en `CustodyEvent` por cada día del período configurado (por defecto 1 año). Esto permite consultas de calendario eficientes sin calcular el patrón en tiempo real.

### Prisma v7
La URL de conexión a la base de datos vive en `prisma.config.ts`, no en el bloque `datasource` de `schema.prisma`. Esto es un requerimiento de Prisma v7.

---

## Scripts disponibles

```bash
npm run start:dev        # Servidor en modo desarrollo con hot-reload
npm run build            # Compilar TypeScript a dist/
npm run start:prod       # Servidor en modo producción desde dist/
npm run lint             # Lint + autofix con ESLint/Prettier
npm run seed             # Cargar datos iniciales
npm run prisma:migrate   # Ejecutar migraciones pendientes
npm run prisma:generate  # Regenerar cliente de Prisma
```
