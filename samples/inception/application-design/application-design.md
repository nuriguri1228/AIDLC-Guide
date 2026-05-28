# Application Design (Consolidated)

> AIDLC Inception > Application Design > Consolidated artifact
> Generated: 2025-01-27T12:04:00Z

This document consolidates the individual design artifacts (`components.md`, `component-methods.md`, `services.md`, `component-dependency.md`) into a single reference for simpler projects.

---

## 1. Overview

This is a single-unit Greenfield project — a Scientific Calculator REST API exposing safe mathematical operations with strict input validation and structured error responses.

**Application Type**: HTTP REST API (single service, single unit)
**Primary Stack**: Python 3.11 + Starlette + Pydantic v2 + Uvicorn
**Deployment Target**: Single uvicorn process (containerizable)

---

## 2. Components

### 2.1 `Engine` (core)
- **Purpose**: Pure math operations and input validation
- **Responsibility**: All numerical computation, NaN/Inf rejection, division-by-zero guarding
- **Statefulness**: Stateless
- **Boundary**: No I/O, no framework dependencies

### 2.2 `API` (interface)
- **Purpose**: HTTP request/response handling
- **Responsibility**: Route definitions, request parsing, response serialization, error mapping
- **Statefulness**: Stateless
- **Boundary**: Depends on `Engine`; framework-coupled to Starlette

### 2.3 `Schemas` (cross-cutting)
- **Purpose**: Pydantic v2 request/response models
- **Responsibility**: Type-safe DTOs, validation rules, OpenAPI schema generation
- **Boundary**: Shared by both `Engine` and `API`

---

## 3. Component Methods (summary)

See `component-methods.md` for full signatures. Key entry points:

| Component | Method | Purpose |
|-----------|--------|---------|
| `Engine` | `add(a, b)`, `subtract(a, b)`, `multiply(a, b)`, `divide(a, b)` | Binary arithmetic |
| `Engine` | `power(base, exp)`, `sqrt(x)`, `log(x, base)`, `factorial(n)` | Advanced math |
| `API` | `POST /v1/calc/{op}` | Generic dispatcher |
| `API` | `GET /v1/health` | Health probe |

---

## 4. Services

Only one logical service: the **Calculator Service** itself (single-unit project).

There is no orchestrator/multi-service topology. The `API` layer directly delegates to the `Engine`.

---

## 5. Component Dependency

```
API ──depends on──▶ Engine
 │                    │
 └──depends on──▶ Schemas ◀──depends on── Engine
```

No circular dependencies. All flow is unidirectional from `API → Engine` via `Schemas`.

---

## 6. Cross-Cutting Concerns

| Concern | Handled By |
|---------|------------|
| Input validation | `Schemas` (Pydantic v2) |
| Error mapping | `API` (Starlette exception handlers) |
| Logging | Standard library `logging` (no separate component) |
| Configuration | Environment variables (no config component) |

---

## 7. Out of Scope

- Multi-tenancy
- Persistence (no database)
- Authentication / authorization (open API for this version)
- Caching (operations are CPU-bound but cheap)
- Rate limiting (deferred to reverse proxy)
