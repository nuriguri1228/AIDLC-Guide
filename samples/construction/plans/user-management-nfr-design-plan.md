# NFR Design Plan — `user-management` unit

> AIDLC Construction > NFR Design > Planning Phase
> Unit: `user-management`
> Generated: 2026-01-20T11:00:00Z

## Execution Checklist

- [ ] Step 1: Read `nfr-requirements/` artifacts (nfr-requirements.md, tech-stack-decisions.md)
- [ ] Step 2: Map NFRs to design patterns (Resilience, Scalability, Performance, Security, Logical Components)
- [ ] Step 3: Validate user answers
- [ ] Step 4: Generate `nfr-design-patterns.md` + `logical-components.md`
- [ ] Step 5: Await user approval

---

## Design Questions (5 categories)

### Category A — Resilience

#### Question A1
How to handle downstream failures (e.g., DB unavailable)?

A) Circuit breaker + cached fallback

B) Retry with exponential backoff (no fallback)

C) Fail-fast (propagate error to caller)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

#### Question A2
Retry policy for transient errors?

A) 3 retries, 100ms→1s exponential backoff with jitter

B) 5 retries, fixed 500ms interval

C) No automatic retries (caller responsibility)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Category B — Scalability

#### Question B1
Stateless vs stateful?

A) Fully stateless (all state in DB / cache)

B) Stateful with sticky sessions

C) Stateless reads, stateful long-running operations

D) Other (please describe after [Answer]: tag below)

[Answer]: 

#### Question B2
Concurrency model?

A) Single-process async (asyncio / uvloop)

B) Multi-process worker pool (gunicorn workers)

C) Thread pool

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Category C — Performance

#### Question C1
Caching strategy?

A) No caching (DB-only)

B) In-memory LRU per process

C) Distributed cache (Redis) — read-through

D) Distributed cache + write-through

E) Other (please describe after [Answer]: tag below)

[Answer]: 

#### Question C2
Connection pooling?

A) PgBouncer (transaction mode)

B) Application-level pool (SQLAlchemy)

C) Both (PgBouncer + app pool)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Category D — Security

#### Question D1
Secrets management?

A) AWS Secrets Manager (per environment)

B) HashiCorp Vault

C) Environment variables (k8s secrets)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

#### Question D2
Encryption at rest?

A) Database-level (Postgres TDE / KMS)

B) Field-level (PII columns encrypted in app)

C) Both (defense in depth)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Category E — Logical Components

#### Question E1
Need a dedicated cache component?

A) Yes — ElastiCache Redis cluster

B) Yes — in-process cache only (no infra)

C) No

D) Other (please describe after [Answer]: tag below)

[Answer]: 

#### Question E2
Need an event bus component?

A) Yes — SNS + SQS

B) Yes — Kafka (MSK)

C) Yes — EventBridge

D) No — synchronous only

E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Approval

> ⏸ **Awaiting user answers.** Fill in each `[Answer]:` tag, then reply "done".
