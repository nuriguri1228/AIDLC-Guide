# Unit-of-Work Clarification Questions

I detected issues with your unit decomposition responses.

---

## Contradiction 1: Coupling vs. Independence

You indicated **"loosely coupled units"** (Q3:A) but mapped 12 of 15 stories to a single unit (Q6), making one unit dominant and the others nearly empty.

### Clarification Question 1
How should we rebalance the unit decomposition?

A) Keep one large unit — those 12 stories share state and cannot be split

B) Split the large unit by responsibility (e.g., read vs. write, sync vs. async)

C) Split by data ownership (each unit owns its own aggregate root)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Ambiguity 2: Dependency Direction

Q8 listed `BillingService → InventoryService` and Q9 listed `InventoryService → BillingService`. Circular dependencies violate the AIDLC unit-of-work rule.

### Clarification Question 2
How should the dependency be modeled?

A) Billing depends on Inventory only (remove Inventory→Billing — use events instead)

B) Inventory depends on Billing only (remove Billing→Inventory)

C) Extract shared dependencies into a new `SharedKernel` unit

D) Use event-driven communication (no direct dependency in either direction)

E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Instructions

Fill in each `[Answer]:` tag with your letter choice. Reply "done" when complete.
