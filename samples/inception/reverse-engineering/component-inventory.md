# Component Inventory

> AIDLC Inception > Reverse Engineering > Package & component inventory
> Generated for brownfield project.

## 1. Summary

| Category | Count |
|----------|-------|
| Application packages | 8 |
| Infrastructure packages | 3 |
| Shared / library packages | 4 |
| Test packages | 5 |
| **Total** | **20** |

---

## 2. Application Packages

| Package | Path | Language | Purpose |
|---------|------|----------|---------|
| `apps.api` | `apps/api/` | Python | FastAPI HTTP entry point |
| `apps.worker` | `apps/worker/` | Python | Celery background workers |
| `services.lending.origination` | `services/lending/origination/` | Python | Loan origination state machine + rules |
| `services.lending.underwriting` | `services/lending/underwriting/` | Python | Risk scoring + decisioning |
| `services.lending.disbursement` | `services/lending/disbursement/` | Python | ACH disbursement client |
| `services.lending.servicing` | `services/lending/servicing/` | Python | Payment schedule + collections |
| `services.catalog.products` | `services/catalog/products/` | Python | Product CRUD + caching |
| `services.notification` | `services/notification/` | Python | Email/SMS dispatch |

## 3. Infrastructure Packages

| Package | Path | Language | Purpose |
|---------|------|----------|---------|
| `infra.stacks` | `infra/stacks/` | TypeScript (CDK) | CDK stacks (LendingStack, NetworkStack, ObservabilityStack) |
| `infra.constructs` | `infra/constructs/` | TypeScript (CDK) | Reusable L3 constructs (ApiGatewayWithAuth, etc.) |
| `infra.config` | `infra/config/` | YAML | Per-environment config (dev/staging/prod) |

## 4. Shared / Library Packages

| Package | Path | Language | Purpose |
|---------|------|----------|---------|
| `services.shared.auth` | `services/shared/auth/` | Python | JWT validation, role checks |
| `services.shared.observability` | `services/shared/observability/` | Python | OpenTelemetry + structlog wiring |
| `services.shared.persistence` | `services/shared/persistence/` | Python | SQLAlchemy session + base repository |
| `services.shared.events` | `services/shared/events/` | Python | Kafka producer + consumer base classes |

## 5. Test Packages

| Package | Path | Test Type | Coverage |
|---------|------|-----------|----------|
| `tests.unit` | `tests/unit/` | Unit tests | 78% |
| `tests.integration` | `tests/integration/` | Cross-service integration | 65% |
| `tests.e2e` | `tests/e2e/` | End-to-end smoke | 12 scenarios |
| `tests.load` | `tests/load/` | k6 load scripts | 4 scenarios |
| `tests.contract` | `tests/contract/` | Pact contract tests | 8 contracts |

---

## 6. Component Types by Layer

```
┌──────────────────────────────────────────────────────┐
│  Entry Layer:   apps.api, apps.worker                │
├──────────────────────────────────────────────────────┤
│  Service Layer: services.lending.*, services.catalog │
├──────────────────────────────────────────────────────┤
│  Shared Layer:  services.shared.*                    │
├──────────────────────────────────────────────────────┤
│  Infra Layer:   infra.*                              │
└──────────────────────────────────────────────────────┘
```
