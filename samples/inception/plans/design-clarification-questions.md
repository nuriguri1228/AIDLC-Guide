# Application Design Clarification Questions

Your responses to the application design questions contain ambiguities that need resolution.

---

## Ambiguity 1: Service Layer Granularity

Q4 indicated **"orchestrator service"** but Q9 marked **"each domain has its own service"**. These define service granularity differently and produce different topologies.

### Clarification Question 1
Which service topology applies?

A) Single orchestrator service that coordinates multiple domain services (mediator pattern)

B) Per-domain services that communicate peer-to-peer (no central orchestrator)

C) Hybrid — orchestrator for cross-domain workflows, peer-to-peer for intra-domain

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Contradiction 2: Component Boundary

Q6 listed **`OrderProcessor`** as a single component, but the description in Q11 split it into 3 sub-components (`OrderValidator`, `OrderPersister`, `OrderNotifier`).

### Clarification Question 2
How should `OrderProcessor` be structured?

A) Single `OrderProcessor` component with 3 internal modules (single component, multi-method)

B) Three separate components — `OrderValidator`, `OrderPersister`, `OrderNotifier`

C) `OrderProcessor` facade exposing the 3 sub-components

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Instructions

Fill in each `[Answer]:` tag with your letter choice. Reply "done" when complete.
