# Deployment Architecture — `user-management`

> AIDLC Construction > Infrastructure Design > Deployment model
> Unit: `user-management`

## 1. Deployment Topology

```
                     ┌─────────────────────────┐
                     │     Route 53            │
                     │ users.example.com       │
                     └────────────┬────────────┘
                                  │
                       ┌──────────▼──────────┐
                       │    CloudFront +     │
                       │       WAF v2        │
                       └──────────┬──────────┘
                                  │
                       ┌──────────▼──────────┐
                       │  ALB (multi-AZ)     │
                       │  TLS 1.3, HTTP/2    │
                       └──────────┬──────────┘
              ┌───────────────────┼───────────────────┐
   ┌──────────▼──────┐  ┌─────────▼───────┐  ┌────────▼────────┐
   │   ECS Fargate   │  │  ECS Fargate    │  │  ECS Fargate    │
   │   AZ us-east-1a │  │  AZ us-east-1b  │  │  AZ us-east-1c  │
   │   2–8 tasks     │  │  2–8 tasks      │  │  2–8 tasks      │
   └──────┬──────────┘  └────────┬────────┘  └────────┬────────┘
          │                      │                    │
          └──────────────────────┴────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                                     │
   ┌──────────▼──────────┐              ┌───────────▼───────────┐
   │  RDS PostgreSQL 15  │              │  ElastiCache Redis 7  │
   │  Multi-AZ (1a/1b)   │              │  Multi-AZ (1a/1b)     │
   │  db.r6g.large       │              │  cache.r6g.large × 2  │
   └─────────────────────┘              └───────────────────────┘
```

## 2. Environment Matrix

| Env | Region | Replicas | DB Size | Cache Size | Purpose |
|-----|--------|----------|---------|------------|---------|
| `dev` | us-east-1 | 1 | db.t4g.micro | cache.t4g.micro | developer self-service |
| `staging` | us-east-1 | 2 | db.t4g.small | cache.t4g.small | pre-prod validation |
| `prod` | us-east-1 | 6–24 (autoscale) | db.r6g.large multi-AZ | cache.r6g.large × 2 | live traffic |
| `prod-dr` | us-west-2 | 0 (cold standby) | db.r6g.large (replica) | n/a | DR target |

## 3. Networking

| Resource | Detail |
|----------|--------|
| **VPC** | 10.0.0.0/16 in us-east-1, 10.1.0.0/16 in us-west-2 |
| **Public subnets** | 10.0.{0,1,2}.0/24 (one per AZ) — ALB only |
| **Private app subnets** | 10.0.{10,11,12}.0/24 — ECS tasks |
| **Private data subnets** | 10.0.{20,21,22}.0/24 — RDS, Redis |
| **NAT Gateway** | one per AZ for outbound to internet (SES, SNS, KMS) |
| **VPC Endpoints** | S3, Secrets Manager, ECR, CloudWatch Logs — keep traffic in-VPC |

## 4. Security Groups

| SG | Allow ingress | Allow egress |
|----|---------------|--------------|
| `alb-sg` | 443/tcp from 0.0.0.0/0 | 80/tcp → `app-sg` |
| `app-sg` | 80/tcp from `alb-sg` | 5432 → `db-sg`, 6379 → `cache-sg`, 443 → 0.0.0.0/0 |
| `db-sg` | 5432/tcp from `app-sg` | none |
| `cache-sg` | 6379/tcp from `app-sg` | none |

## 5. Autoscaling

| Resource | Min | Max | Trigger | Cooldown |
|----------|-----|-----|---------|----------|
| ECS service tasks | 6 (2 per AZ) | 24 | TargetTracking CPU 60% | 60 s |
| ECS service tasks | — | — | TargetTracking ALB requests/target 200/sec | 60 s |
| RDS read replicas | 1 | 4 | manual + CloudWatch alarm | manual |

## 6. Deployment Pipeline

| Stage | Tool | Gate |
|-------|------|------|
| Build | GitHub Actions | unit + integration tests must pass |
| Image push | ECR | Trivy scan, no HIGH/CRITICAL CVEs |
| Deploy dev | CDK Pipeline | auto on `main` merge |
| Deploy staging | CDK Pipeline | auto after dev deploy + smoke pass |
| Deploy prod | CDK Pipeline | **manual approval** + blue/green |

## 7. Blue/Green Deployment

- **Strategy**: ECS Service with CodeDeploy controller
- **Test traffic**: 5% canary for 5 min → CloudWatch alarms green → 100% switch
- **Rollback**: automatic on alarm trigger; manual within 10 min after switch

## 8. Cost Estimate (prod, monthly)

| Resource | Estimate |
|----------|----------|
| ECS Fargate (avg 12 tasks × 1 vCPU × 2 GB) | $260 |
| RDS db.r6g.large multi-AZ + 100GB | $480 |
| ElastiCache cache.r6g.large × 2 | $310 |
| ALB + WAF | $35 |
| Data transfer (estimated 100 GB) | $9 |
| CloudWatch (logs + metrics) | $80 |
| **Total** | **~$1,174/month** |
