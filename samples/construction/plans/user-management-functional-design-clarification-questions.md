# Functional Design Clarification Questions — `user-management`

I detected ambiguities in your functional-design plan responses.

---

## Ambiguity 1: Aggregate vs Entity Boundary

You selected **"`Account` is the aggregate root"** (Q1:B) but described **"separate `Profile` and `Credentials` tables with their own IDs and lifecycles"** (Q11). Aggregates with internal entities having independent lifecycles violate DDD aggregate consistency rules.

### Clarification Question 1
How should the boundary be drawn?

A) Promote `Profile` and `Credentials` to their own aggregates (each with own root)

B) Keep `Account` as single aggregate; `Profile`/`Credentials` are internal entities with no independent persistence

C) `Account` is aggregate; `Profile` and `Credentials` are value objects (immutable, replaced wholesale)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Contradiction 2: Soft-delete vs Hard-delete

Q3:B picked **4-state with soft-delete** (`pending`/`active`/`disabled`/`deleted`) but Q5:C requires **GDPR right-to-be-forgotten** which mandates hard deletion of PII on user request.

### Clarification Question 2
How do we reconcile?

A) Soft-delete (status=`deleted`) + scheduled GDPR purge job runs after 30 days

B) Hard delete on GDPR request, but keep anonymized audit record (no PII)

C) Soft-delete + immediate PII redaction on `deleted` transition (audit trail preserved)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Instructions

Fill in each `[Answer]:` and reply "done" when complete.
