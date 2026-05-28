# Infrastructure Design Plan — `user-management` unit

> AIDLC Construction > Infrastructure Design > Planning Phase
> Unit: `user-management`
> Generated: 2026-01-20T13:30:00Z

## Execution Checklist

- [ ] Step 1: Read `functional-design/` + `nfr-design/` artifacts
- [ ] Step 2: Map logical components to cloud services
- [ ] Step 3: Define network topology (VPC, subnets, security groups)
- [ ] Step 4: Define deployment architecture (compute, scaling, regions)
- [ ] Step 5: Validate user answers
- [ ] Step 6: Generate `infrastructure-design.md` + `deployment-architecture.md` (+ `shared-infrastructure.md` if applicable)
- [ ] Step 7: Await user approval

---

## Infrastructure Questions (7 categories)

### Category A — Cloud Provider

#### Question A1
Target cloud?

A) AWS

B) Azure

C) Google Cloud

D) On-premises

E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Category B — Compute

#### Question B1
Compute model?

A) AWS Lambda (serverless functions)

B) ECS Fargate (containers, managed)

C) EC2 (self-managed VMs)

D) EKS (Kubernetes)

E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Category C — Networking

#### Question C1
Public access?

A) Public via API Gateway + WAF

B) Public via ALB + WAF

C) Internal only (VPC + private LB)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

#### Question C2
VPC topology?

A) Single VPC, multi-AZ private subnets

B) Multi-VPC with Transit Gateway

C) Existing shared VPC

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Category D — Persistence

#### Question D1
Primary database?

A) RDS PostgreSQL (multi-AZ)

B) Aurora PostgreSQL (multi-AZ + read replicas)

C) DynamoDB

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Category E — Cache / Messaging

#### Question E1
Cache infrastructure?

A) ElastiCache Redis (cluster mode)

B) ElastiCache Redis (single node)

C) MemoryDB for Redis

D) None

E) Other (please describe after [Answer]: tag below)

[Answer]: 

#### Question E2
Event/message bus?

A) SQS + SNS

B) EventBridge

C) MSK (Kafka)

D) None

E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Category F — Observability

#### Question F1
Logging / metrics / tracing?

A) CloudWatch only

B) CloudWatch + X-Ray

C) CloudWatch + X-Ray + Grafana

D) Self-hosted ELK + Prometheus + Jaeger

E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Category G — Secrets & Config

#### Question G1
Secrets store?

A) AWS Secrets Manager

B) Parameter Store (SecureString)

C) HashiCorp Vault

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Approval

> ⏸ **Awaiting user answers.** Fill in each `[Answer]:` tag, then reply "done".
