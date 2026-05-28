# Unit-of-Work Generation Plan

> AIDLC Inception > Units Generation > Planning Phase
> Generated: 2025-01-27T12:04:45Z

## Purpose

Decompose the system defined in `application-design.md` into independently deployable units of work.

---

## Execution Checklist

- [ ] Step 1: Analyze application-design artifacts and identify candidate unit boundaries
- [ ] Step 2: Apply unit decomposition criteria (data ownership, deployment independence, team boundaries)
- [ ] Step 3: Validate unit-of-work-plan answers
- [ ] Step 4: Resolve contradictions/ambiguities via clarification round (if needed)
- [ ] Step 5: Generate `unit-of-work.md` (definitions + responsibilities)
- [ ] Step 6: Generate `unit-of-work-dependency.md` (dependency matrix)
- [ ] Step 7: Generate `unit-of-work-story-map.md` (stories ↔ units mapping)
- [ ] Step 8: Present completion message
- [ ] Step 9: Await explicit user approval

---

## Decomposition Questions

### Question 1
What is the primary decomposition criterion?

A) Domain boundaries (bounded contexts from DDD)

B) Data ownership (each unit owns its own data store)

C) Team boundaries (Conway's Law alignment)

D) Deployment cadence (units that deploy together)

E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 2
How should shared cross-cutting concerns (auth, logging, observability) be structured?

A) Dedicated `shared` unit consumed by all other units

B) Library / module embedded into each unit at build time

C) External infrastructure (sidecar, service mesh, etc.) — not modeled as a unit

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 3
Maximum acceptable inter-unit dependency depth?

A) 1 (units only depend on `shared`, no chains)

B) 2 (one-hop dependencies allowed)

C) Unlimited (DAG enforced, but any depth acceptable)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 4
Communication style between units?

A) Synchronous HTTP/gRPC only

B) Asynchronous events only

C) Hybrid — sync for queries, async for state changes

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 5
Granularity preference?

A) Few large units (3–5 units, larger scope each)

B) Many small units (10+ units, narrower scope)

C) Adaptive — let domain boundaries decide

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Mandatory Unit Artifacts

The following will be generated after answers are collected and approved:

| Artifact | Purpose |
|----------|---------|
| `unit-of-work.md` | Each unit's definition, scope, responsibilities |
| `unit-of-work-dependency.md` | Inter-unit dependency matrix (table + Mermaid graph) |
| `unit-of-work-story-map.md` | Mapping of every user story → assigned unit(s) |

---

## Approval

> ⏸ **Awaiting user input** — please fill in each `[Answer]:` tag, then reply "done" so I can proceed to validation and artifact generation.
