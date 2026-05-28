# Shared Infrastructure

> AIDLC Construction > Infrastructure Design > Shared across multiple units
> Generated when multiple units share the same infrastructure components.

## 1. Purpose

This document captures infrastructure that is **shared by more than one unit** in the project. Keeping it in a separate document avoids duplication in each unit's `infrastructure-design.md` and provides a single source of truth for ops teams.

---

## 2. Shared Components

### 2.1 VPC & Networking
- **One VPC** per region (`vpc-app-prod` in us-east-1, `vpc-app-prod-dr` in us-west-2)
- Shared subnets across all unit ECS services
- Shared NAT Gateway (per AZ), Transit Gateway for cross-VPC

### 2.2 Container Registry (ECR)
- **One repository per unit**: `ecr/user-management`, `ecr/catalog-service`, `ecr/lending-service`
- Shared image scanning policy (Trivy + ECR scan on push)
- Lifecycle: retain 30 most recent tagged images

### 2.3 Observability Stack
- **CloudWatch log group**: `/aws/ecs/<unit-name>/<env>` per unit
- **Shared dashboard**: `prod-overview` aggregates metrics from all units
- **X-Ray service map**: cross-unit calls traced via OpenTelemetry → X-Ray exporter
- **Alarm SNS topic**: `prod-alerts` → PagerDuty

### 2.4 Secrets & KMS
- **One KMS CMK per env** (`alias/app-prod`, `alias/app-staging`, `alias/app-dev`)
- Used by:
  - RDS storage encryption (all units' DBs)
  - Secrets Manager (DB creds, API keys)
  - S3 bucket encryption
- **Rotation**: KMS auto rotation enabled (yearly)

### 2.5 Event Bus
- **One MSK cluster** per env shared by all event-publishing units
- Per-unit topic prefix: `lending.*`, `catalog.*`, `user.*`
- ACLs restrict producers to their own topic prefix; consumers cross-topic

### 2.6 CI/CD Pipeline
- **One CodePipeline per unit** sourcing from a per-unit folder in the monorepo
- Shared CodeBuild project pool (configurable per pipeline)
- Shared artifact bucket: `s3://app-pipeline-artifacts/`

### 2.7 Route 53 Hosted Zones
- Shared hosted zone: `example.com`
- Per-unit subdomain: `users.example.com`, `lending.example.com`, etc.
- ACM cert: wildcard `*.example.com` in us-east-1 (CloudFront) + per-region for ALB

---

## 3. Tagging Standard

All shared resources tagged with:

| Tag | Value |
|-----|-------|
| `Project` | `lending-platform` |
| `Owner` | `platform-team` |
| `Env` | `prod | staging | dev` |
| `Shared` | `true` |
| `CostCenter` | `eng-001` |

---

## 4. Change Management

Changes to shared infrastructure require:
1. RFC document in `infra/rfcs/`
2. Review by platform-team (2 approvals)
3. CDK plan output attached to PR
4. Deploy via `infra-shared` pipeline (separate from per-unit pipelines)

---

## 5. Out of Scope (per-unit infrastructure)

The following are NOT shared — each unit owns its own:
- ECS service + task definition
- ALB target group + listener rules
- RDS instance (some units share read replicas — see unit-specific docs)
- ElastiCache (sometimes shared, sometimes per-unit — see unit docs)
- IAM roles for application code
