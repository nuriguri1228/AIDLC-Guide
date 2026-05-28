# Logical Components — `user-management`

> AIDLC Construction > NFR Design > Logical infrastructure components
> Unit: `user-management`

## 1. Component Map

```
                ┌──────────────────────────┐
                │  Public Load Balancer    │
                │  (TLS termination, WAF)  │
                └────────────┬─────────────┘
                             │
                ┌────────────▼─────────────┐
                │  user-management API     │
                │  (stateless replicas)    │
                └────┬──────┬──────────┬───┘
                     │      │          │
            ┌────────▼─┐   ┌▼────────┐ │
            │ DB Cache │   │ Primary │ │
            │ (Redis)  │   │   DB    │ │
            └──────────┘   └─────────┘ │
                                       │
                              ┌────────▼────────┐
                              │  Event Bus       │
                              │  (SQS / Kafka)   │
                              └─────────────────┘
```

---

## 2. Component Inventory

### 2.1 Public Load Balancer
- **Logical type**: Layer-7 LB
- **Responsibilities**: TLS termination, WAF, health checks, ALB target group routing
- **Tech mapping**: AWS ALB + WAF v2 (suggested; see infrastructure-design.md)
- **Scaling**: managed (no app concern)

### 2.2 Application Compute
- **Logical type**: Stateless API replicas
- **Responsibilities**: HTTP routing, business logic, async event publish
- **Tech mapping**: ECS Fargate (suggested) or Lambda
- **Min replicas**: 3 (one per AZ)
- **Max replicas**: 20
- **Scale trigger**: target CPU utilization 60%

### 2.3 Cache
- **Logical type**: Distributed in-memory key-value store
- **Responsibilities**: User profile cache, auth token cache
- **Tech mapping**: ElastiCache Redis 7.x (cluster mode disabled, 2 nodes)
- **Memory**: 4 GB
- **Eviction**: allkeys-lru

### 2.4 Primary Database
- **Logical type**: Relational, ACID, transactional
- **Responsibilities**: All persistent user data
- **Tech mapping**: RDS PostgreSQL 15 (multi-AZ)
- **Storage**: 100 GB gp3, encrypted via KMS
- **Backups**: 7-day retention, point-in-time recovery

### 2.5 Read Replicas
- **Logical type**: Read-only DB replica
- **Responsibilities**: Admin search, reporting queries
- **Tech mapping**: Aurora replica or RDS replica
- **Count**: 1 initially; scale on demand

### 2.6 Event Bus
- **Logical type**: Pub/sub messaging
- **Responsibilities**: Domain events (`UserCreated`, `UserDisabled`, `PasswordChanged`)
- **Tech mapping**: SNS + SQS (suggested) or EventBridge
- **Delivery**: at-least-once, idempotent consumers
- **DLQ**: yes, after 3 failed attempts

### 2.7 Secrets Store
- **Logical type**: Encrypted secrets
- **Responsibilities**: DB credentials, JWT signing key, KMS data keys
- **Tech mapping**: AWS Secrets Manager
- **Rotation**: 30-day automatic for DB

### 2.8 Observability Stack
- **Logical type**: Logs, metrics, traces
- **Responsibilities**: Centralized observability
- **Tech mapping**: CloudWatch Logs, CloudWatch Metrics, X-Ray
- **Retention**: logs 14 days hot / 1 year cold (S3); metrics 90 days

---

## 3. Cross-Cutting Components

| Component | Purpose | Tech |
|-----------|---------|------|
| Auth middleware | JWT verification, role check | Application-level (FastAPI dependency) |
| Rate limiter | Per-user request quota | Redis-backed sliding window |
| Audit logger | PII access log | Separate Kafka topic → S3 archive |
| Request ID propagation | Trace correlation | Middleware injects X-Request-ID |

---

## 4. External Dependencies

| External | Purpose | Protocol |
|----------|---------|---------|
| KYC provider | Identity verification | HTTPS REST |
| Email provider (SES) | Transactional emails | AWS SDK |
| SMS provider (SNS) | OTP delivery | AWS SDK |

---

## 5. Data Flow Examples

### Signup Flow
```
Client → ALB → API → [DB INSERT user] → [Publish UserCreated → Event Bus] → 200 OK
                              ↓
                         (async) Email service consumes UserCreated → send welcome email
```

### Login Flow
```
Client → ALB → API → [Cache GET email→user] (miss)
                  → [DB SELECT user WHERE email]
                  → [Cache SET user]
                  → [bcrypt verify password]
                  → [Generate JWT (signing key from Secrets Manager)]
                  → 200 OK { access_token, refresh_token }
```
