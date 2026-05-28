# NFR Requirements Clarification — `user-management`

Detected mismatches in your NFR requirements plan.

---

## Contradiction 1: Throughput vs Latency Mismatch

Q1:D (> 1,000 req/s) combined with Q2:A (≤ 50 ms P99) requires aggressive caching and pre-computation. The functional design did not mention caching layer, suggesting these targets may not be achievable as currently designed.

### Clarification Question 1
How should we proceed?

A) Accept the targets — add a caching layer (Redis) to the design

B) Relax latency target to ≤ 200 ms (more realistic without cache)

C) Reduce throughput target to ≤ 100 req/s (fits in-memory of single node)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Ambiguity 2: Availability vs Scaling Model

Q3:D (99.99% SLA) typically requires multi-AZ active-active, but Q5:C selected single-instance vertical-only scaling. Single instance cannot achieve 99.99%.

### Clarification Question 2
Which constraint dominates?

A) Keep 99.99% SLA — switch to multi-AZ active-active (overrides Q5:C)

B) Keep single-instance — relax SLA to 99.9%

C) Active-passive multi-AZ (failover) — 99.95% achievable

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Instructions

Fill in `[Answer]:` for each, reply "done".
