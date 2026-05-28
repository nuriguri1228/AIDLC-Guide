# NFR Design Clarification — `user-management`

Detected inconsistencies in NFR design responses.

---

## Contradiction 1: Stateless vs Sticky Sessions

You selected **fully stateless** (Q-B1:A) but also **sticky sessions for caching** (Q-C1:B in-memory LRU). In-memory cache is incompatible with stateless scale-out because cache is per-replica.

### Clarification Question 1
A) Switch to distributed cache (Redis) — keeps stateless

B) Accept sticky sessions — re-classify Q-B1 as B (stateful)

C) Drop in-memory cache — DB-only with prepared-statement plan cache

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Ambiguity 2: Encryption Scope

Q-D2:C (both DB + field-level) — please clarify which columns are field-level encrypted.

### Clarification Question 2
A) Email + phone only (most-PII fields)

B) All PII columns (email, phone, address, SSN-last-4)

C) Credentials only (already hashed, no field encryption needed)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Instructions

Fill in `[Answer]:` for each, reply "done".
