# NFR Design Patterns — `user-management`

> AIDLC Construction > NFR Design > Pattern selection
> Unit: `user-management`

## 1. Resilience Patterns

### Circuit Breaker
- **Where**: External calls (KYC provider, payment gateway)
- **Library**: `tenacity` (Python) — `@retry` + `@before_sleep`
- **Settings**:
  - Failure threshold: 5 failures in 30s
  - Open duration: 60s
  - Half-open trial count: 1
- **Fallback**: cached "stale-acceptable" response when available; otherwise return `503 ServiceUnavailable`

### Retry with Exponential Backoff + Jitter
- **Where**: Transient DB / cache errors, Kafka publish
- **Settings**: 3 attempts, 100ms → 200ms → 800ms, ±25% jitter
- **Idempotency**: required for non-idempotent operations (use idempotency-key header)

### Bulkhead
- **Where**: Thread pool for external integrations
- **Settings**: Bounded pool size 20, queue size 50, reject when full
- **Purpose**: Prevent slow downstream from saturating all workers

---

## 2. Scalability Patterns

### Stateless Application
- All session state externalized to Redis or DB
- Replicas behind ALB, sticky sessions disabled
- Horizontal autoscale on CPU > 60% (target tracking)

### CQRS-lite (Read replicas)
- Write traffic → primary RDS
- Read-heavy traffic (`GET /v1/admin/users?...`) → Aurora reader endpoint
- Eventual consistency acceptable for admin search

### Async Decoupling
- User signup `POST /v1/users` → enqueues `UserCreated` event
- Downstream subscribers (welcome email, profile cache warming) consume async
- API responds < 100ms; downstream may take seconds

---

## 3. Performance Patterns

### Distributed Cache (Read-through)
- **Where**: User lookups by `user_id` and `email`
- **Tech**: ElastiCache Redis (cluster mode disabled, 2-node primary/replica)
- **TTL**: 5 min for profile, 60 sec for auth tokens, infinity for immutable IDs
- **Invalidation**: on-write, app pushes `DEL` to cache

### Connection Pooling
- PgBouncer in transaction mode (default 25 server conns / DB)
- App-level SQLAlchemy pool 10 conns/replica
- Effective concurrency: 25 × N replicas

### Prepared Statements
- All ORM queries use server-side prepared statements (SQLAlchemy 2.0 default)

---

## 4. Security Patterns

### Token-based Auth (JWT)
- Access token: RS256, 15 min lifetime, includes `sub`, `role`, `aud`, `exp`
- Refresh token: opaque, server-side stored, 30-day lifetime, rotated on use
- All endpoints (except `/login`, `/signup`, `/forgot`) require Bearer token

### Defense-in-Depth Encryption
- TLS 1.3 in transit (ALB enforces TLS_AES_256_GCM_SHA384)
- DB at-rest: KMS-encrypted RDS storage
- Field-level: PII columns (email, phone) encrypted via app using KMS data keys

### Secrets Management
- All secrets in AWS Secrets Manager
- Rotation: DB password every 30 days (RDS-managed)
- Application reads at startup, refreshes on `SIGHUP`

### Input Validation
- Pydantic v2 models reject unknown fields, enforce types
- Email RFC 5322 validation
- Password strength: ≥ 12 chars, mixed case + digit + symbol

---

## 5. Observability Patterns

### Structured Logging
- `structlog` with JSON renderer
- Required fields: `timestamp`, `level`, `event`, `request_id`, `user_id` (when authenticated), `trace_id`
- PII never logged (email/SSN auto-redacted)

### Distributed Tracing
- OpenTelemetry Python SDK
- Spans on: HTTP route, DB query, cache call, external HTTP call
- Sampled at 10% baseline, 100% for errors (tail-based sampling)

### Metrics (RED method)
- **Rate**: requests/sec per route
- **Errors**: 5xx + 4xx counts per route
- **Duration**: histogram per route (P50/P95/P99 published)

---

## 6. Pattern Decision Matrix

| NFR | Pattern Applied |
|-----|----------------|
| P99 latency ≤ 200ms | Cache + connection pool + prepared statements |
| Throughput 500 req/s | Stateless + horizontal autoscale + read replicas |
| Availability 99.95% | Multi-AZ + circuit breaker + graceful degradation |
| RPO < 1 min | Multi-AZ RDS with synchronous standby |
| Security PII | Field encryption + KMS + TLS 1.3 + audit log |
