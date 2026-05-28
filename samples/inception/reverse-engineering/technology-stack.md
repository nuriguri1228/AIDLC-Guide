# Technology Stack

> AIDLC Inception > Reverse Engineering > Technology stack analysis
> Generated for brownfield project.

## 1. Languages

| Language | Version | Where used |
|----------|---------|-----------|
| Python | 3.11.x | All application & service code |
| TypeScript | 5.3.x | CDK infrastructure (`infra/`) |
| SQL | PostgreSQL 15 dialect | Schema migrations |
| YAML | — | Config, CI/CD |
| Bash | — | Operational scripts |

## 2. Application Frameworks

| Framework | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.110.x | HTTP API |
| Pydantic | v2.6.x | Request/response models, validation |
| SQLAlchemy | 2.0.x (async) | ORM |
| Alembic | 1.13.x | Schema migrations |
| Celery | 5.3.x | Async background work |
| grpcio | 1.62.x | gRPC service-to-service |
| tenacity | 8.2.x | Retry / circuit breaker |
| structlog | 24.x | Structured logging |
| OpenTelemetry SDK | 1.24.x | Tracing/metrics |

## 3. Infrastructure (AWS)

| Service | Purpose |
|---------|---------|
| API Gateway (HTTP API) | Public ingress |
| Lambda | Async event processing |
| ECS Fargate | Long-running HTTP API + workers |
| RDS PostgreSQL | Primary data store (multi-AZ) |
| ElastiCache Redis | Session cache, rate-limit counters |
| MSK (Kafka) | Event streaming |
| S3 | Document storage |
| Secrets Manager | DB creds, API keys |
| KMS | Envelope encryption |
| CloudWatch | Logs + metrics |
| X-Ray | Distributed tracing |
| WAF | Application firewall |

## 4. Build & Test Tools

| Tool | Purpose |
|------|---------|
| Poetry 1.7 | Python dependency management |
| pnpm 9 | TypeScript/CDK dependencies |
| Ruff 0.4 | Lint + format (Python) |
| Black 24.x | Formatter (Python, used pre-Ruff migration) |
| Mypy 1.9 (strict) | Type checking |
| pytest 8.x | Test runner |
| pytest-asyncio | Async test support |
| pytest-cov | Coverage |
| Pact | Contract testing |
| k6 | Load testing |
| Bandit, Safety, Semgrep | SAST + dependency scanning |

## 5. CI / CD

| Component | Tooling |
|-----------|---------|
| Source control | GitHub (private) |
| CI | GitHub Actions |
| Container registry | Amazon ECR |
| Image scanning | Trivy + ECR scan |
| Deployment | CDK + CodePipeline (per-env) |
| IaC review | Checkov |
| Secrets scanning | gitleaks (pre-commit) |

## 6. Observability

| Concern | Tool |
|---------|------|
| Logs | CloudWatch Logs + structured JSON (structlog) |
| Metrics | CloudWatch Metrics + Prometheus exporter |
| Traces | X-Ray (via OpenTelemetry) |
| Dashboards | CloudWatch dashboards + Grafana (self-hosted) |
| Alerts | CloudWatch Alarms → SNS → PagerDuty |
