# Infrastructure Design Clarification — `user-management`

Detected mismatches in infrastructure design responses.

---

## Contradiction 1: Compute vs Network Mismatch

You selected **AWS Lambda** (Q-B1:A) but also **public access via ALB** (Q-C1:B). Lambda doesn't sit behind ALB by default — the common pattern is Lambda + API Gateway.

### Clarification Question 1
A) Switch to API Gateway as the ingress (Lambda + APIGW)

B) Switch to ECS Fargate (works with ALB)

C) Keep Lambda + ALB (Lambda target — supported but unusual)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Ambiguity 2: Multi-region?

You requested 99.99% availability in NFR but selected single-AZ VPC topology hint in Q-C2. 99.99% typically requires multi-region or at minimum multi-AZ active-active.

### Clarification Question 2
A) Single-region multi-AZ active-active (RDS Multi-AZ + ECS across 3 AZs)

B) Multi-region active-passive (DR region for failover)

C) Multi-region active-active (Aurora Global + Route 53 latency routing)

D) Relax SLA to 99.9% — single-AZ acceptable

E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Instructions

Fill in `[Answer]:` for each, reply "done".
