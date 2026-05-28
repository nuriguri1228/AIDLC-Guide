# Code Structure

> AIDLC Inception > Reverse Engineering > Code structure analysis
> Generated for brownfield project. Reflects current code state as of timestamp.

## 1. Repository Layout

```
.
├── apps/
│   ├── api/                     # HTTP API entry point (FastAPI)
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── main.py
│   └── worker/                  # Async background workers (Celery)
│       └── tasks/
├── services/
│   ├── lending/                 # Loan origination domain logic
│   ├── catalog/                 # Loan product catalog
│   └── shared/                  # Cross-cutting (auth, logging)
├── infra/                       # CDK infrastructure-as-code
│   ├── stacks/
│   └── constructs/
├── tests/
│   ├── unit/                    # Per-module unit tests
│   ├── integration/             # Cross-service integration
│   └── e2e/                     # End-to-end smoke tests
├── pyproject.toml               # Poetry project file
├── poetry.lock
└── README.md
```

## 2. Build System

| Aspect | Tooling |
|--------|---------|
| **Package manager** | Poetry 1.7.x |
| **Python version** | 3.11.x (pinned via `pyproject.toml`) |
| **Linter** | Ruff |
| **Formatter** | Black |
| **Type checker** | Mypy (strict mode) |
| **Test runner** | pytest + pytest-asyncio |
| **Coverage** | pytest-cov (target ≥ 80%) |

## 3. File Inventory (key files)

| Path | Purpose |
|------|---------|
| `apps/api/main.py` | FastAPI app instantiation + middleware wiring |
| `apps/api/routes/applications.py` | `/applications` REST endpoints |
| `apps/api/routes/health.py` | Liveness/readiness probes |
| `services/lending/origination/state_machine.py` | Loan application state transitions |
| `services/lending/origination/eligibility.py` | Rules-based eligibility engine |
| `services/lending/underwriting/scorer.py` | Risk scoring (calls external ML service) |
| `services/lending/disbursement/ach.py` | ACH integration client |
| `services/catalog/products/repository.py` | Loan product CRUD + caching |
| `services/shared/auth/jwt.py` | JWT validation middleware |
| `services/shared/observability/tracing.py` | OpenTelemetry instrumentation |
| `infra/stacks/lending_stack.py` | CDK stack: API Gateway + Lambda + RDS |

## 4. Design Patterns Identified

- **Repository pattern**: `services/*/repository.py` — abstracts persistence
- **State machine**: `LoanApplicationStateMachine` (transitions enforced via Pydantic + custom decorator)
- **Strategy**: `EligibilityRule` base class with per-rule subclasses
- **Adapter**: `ACHClient` and `KYCClient` for external service integrations
- **Circuit breaker**: applied to external service calls via `tenacity` library

## 5. Critical Dependencies

| Module | Risk | Reason |
|--------|------|--------|
| `services/lending/underwriting/scorer.py` | **High** | Synchronous dependency on external ML service — adds latency, single point of failure |
| `services/lending/origination/state_machine.py` | **Medium** | Central to all workflows — changes require coordinated updates |
| `services/shared/auth/jwt.py` | **Medium** | Touched by every authenticated request |

## 6. Test Coverage Snapshot

| Layer | Coverage | Notes |
|-------|----------|-------|
| `services/lending/` | 78% | Above target except for `scorer.py` (62% — external dependency mocking incomplete) |
| `services/catalog/` | 91% | Mature, stable |
| `services/shared/` | 84% | Auth module fully covered |
| `apps/api/` | 68% | Below target — needs more integration tests |

## 7. Statistics

- **Total .py files**: 247
- **Total LOC**: 18,420 (excluding tests)
- **Test LOC**: 9,180
- **Cyclomatic complexity (avg)**: 4.2 (good — target < 10)
- **Cyclomatic complexity (max)**: 18 in `state_machine.transition()` (consider refactoring)
