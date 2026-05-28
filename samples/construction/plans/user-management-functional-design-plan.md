# Functional Design Plan — `user-management` unit

> AIDLC Construction > Functional Design > Planning Phase
> Unit: `user-management`
> Generated: 2026-01-20T09:11:00Z

## Purpose

Plan the detailed business logic and domain model for the `user-management` unit, building on top of the unit's `application-design` artifacts.

---

## Execution Checklist

- [ ] Step 1: Read `unit-of-work.md`, `unit-of-work-story-map.md` for unit scope and assigned stories
- [ ] Step 2: Identify domain entities for this unit
- [ ] Step 3: Map business rules per entity / use case
- [ ] Step 4: Identify edge cases and invariants
- [ ] Step 5: Determine if frontend components are needed (UI in scope?)
- [ ] Step 6: Validate user answers
- [ ] Step 7: Generate `business-logic-model.md`, `business-rules.md`, `domain-entities.md` (+ `frontend-components.md` if applicable)
- [ ] Step 8: Await user approval

---

## Functional Design Questions

### Question 1
What is the primary aggregate root for `user-management`?

A) `User` — single root, simple model

B) `Account` — wraps `User` plus credentials/settings

C) `Identity` — federated identity with multiple user records

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 2
How are credentials stored and verified?

A) Password (bcrypt hashing) only

B) Password + TOTP MFA (mandatory for all users)

C) Password + optional MFA (TOTP / WebAuthn)

D) WebAuthn passkeys only (passwordless)

E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 3
What lifecycle states does a user account have?

A) `active` / `disabled` only (binary)

B) `pending` / `active` / `disabled` / `deleted` (4-state with soft-delete)

C) `pending` / `active` / `locked` / `disabled` / `deleted` (5-state including security lock)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 4
Are there frontend components for this unit?

A) No — backend-only (admin tools via separate UI)

B) Yes — user profile UI (login form, profile edit)

C) Yes — admin UI for user management

D) Both B and C

E) Other (please describe after [Answer]: tag below)

[Answer]: 

---

### Question 5
Audit / compliance requirements?

A) None special — standard application logging

B) PII access must be logged with reason

C) GDPR — full audit trail + data export / right-to-be-forgotten

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Approval

> ⏸ **Awaiting user answers.** Fill in each `[Answer]:` tag, then reply "done".
