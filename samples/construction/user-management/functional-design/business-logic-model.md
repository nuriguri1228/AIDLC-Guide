# Business Logic Model — `user-management`

> AIDLC Construction > Functional Design > Business logic specification
> Unit: `user-management`

## 1. Use Cases

| ID | Use Case | Actor | Trigger |
|----|----------|-------|---------|
| UC-01 | Sign up | Visitor | Visitor submits signup form |
| UC-02 | Verify email | New user | User clicks verification link |
| UC-03 | Log in | Registered user | User submits login form |
| UC-04 | Refresh token | Authenticated user | Access token near expiry |
| UC-05 | Log out | Authenticated user | User clicks "log out" |
| UC-06 | Reset password | Locked-out user | User requests reset |
| UC-07 | Enroll MFA | Authenticated user | User opts in to MFA |
| UC-08 | Update profile | Authenticated user | User edits profile |
| UC-09 | Disable user | Admin | Admin marks user as disabled |
| UC-10 | Delete user (GDPR) | User or Admin | Right-to-be-forgotten request |

---

## 2. Sign-up Flow (UC-01)

```
1. Validate signup payload (email format, password strength)
2. Check for existing account with same email — if exists: 409 Conflict
3. Hash password (bcrypt cost=12)
4. Insert `User` row with status="pending"
5. Generate email verification token (random 32-byte URL-safe, 24h expiry)
6. Persist token in `EmailVerifications` table
7. Publish `UserCreated` event (async)
8. Email service (subscriber) sends verification email
9. Respond 201 Created with user_id
```

### Edge cases
- **Concurrent signup with same email**: DB unique constraint on `users.email` (lower-cased) — second writer gets 409
- **Token already used**: idempotent — re-sending verification regenerates token, invalidates old
- **Email send failure**: signup succeeds, user can request resend from `/signup/resend`

---

## 3. Login Flow (UC-03)

```
1. Validate payload
2. Lookup user by email (case-insensitive)
3. If not found OR password incorrect: increment failed-attempt counter, return 401
4. If status != "active": return 403 with reason (pending/disabled/locked)
5. If MFA enrolled: respond 200 with `mfa_required=true` and challenge token
6. Else: issue JWT access token (15 min) + refresh token (30 days)
7. Reset failed-attempt counter
8. Publish `UserLoggedIn` event
```

### Lock-out policy
- 5 failed attempts in 15 min → status="locked" for 30 min
- After lock-out timer: status reverts to "active" automatically

---

## 4. Refresh Token Flow (UC-04)

```
1. Verify refresh token (server-side lookup in `RefreshTokens` table)
2. Check token not revoked, not expired
3. Verify user.status == "active"
4. Issue new access token + rotated refresh token
5. Mark old refresh token as revoked
```

### Token rotation
- Each refresh issues a new refresh token AND revokes the previous one
- Detected reuse of revoked token → revoke ALL tokens for that user (potential theft)

---

## 5. Password Reset (UC-06)

```
1. User requests reset for email
2. ALWAYS respond 202 (regardless of user existence) — prevent enumeration
3. If user exists: generate reset token (1h expiry), send reset email
4. User clicks link → enters new password
5. Verify token, update password hash, revoke all sessions
6. Send confirmation email
```

---

## 6. MFA Enrollment (UC-07)

| Method | Implementation |
|--------|---------------|
| TOTP | RFC 6238, 30s window, ±1 drift, secret stored encrypted |
| WebAuthn | FIDO2 server library, attestation verified, credential stored per-user |
| SMS (backup) | Twilio integration, rate-limited to 5/day |

User must verify the second factor before it becomes the default.

---

## 7. State Machine

```
pending ─verify_email─▶ active ─disable─▶ disabled
   │                     │  ▲                │
   └────expire (7d)────▶ deleted             │
                         ▲ │                 │
                         │ └─5_failed─▶ locked
                         │     unlock_timer  │
                         │◀──────────────────┘
                         │
                         └─gdpr_request─▶ deleted (PII purged)
```

---

## 8. Domain Events Published

| Event | When | Payload |
|-------|------|---------|
| `UserCreated` | After successful signup | `{user_id, email, created_at}` |
| `UserVerified` | After email verification | `{user_id, verified_at}` |
| `UserLoggedIn` | Successful login | `{user_id, login_at, ip, user_agent}` |
| `UserDisabled` | Admin disable | `{user_id, disabled_by, reason}` |
| `UserDeleted` | GDPR delete | `{user_id, deleted_at}` (no PII) |
| `PasswordChanged` | Successful change/reset | `{user_id, changed_at}` |
| `MFAEnrolled` | Enroll new factor | `{user_id, method}` |

---

## 9. Invariants

1. `email` is globally unique (case-insensitive)
2. A `User` always has at least one credential (password) once status=`active`
3. `status` transitions only follow the state machine in §7
4. `RefreshToken.user_id` matches the user the token was issued for
5. Deleted users (status=`deleted`) have all PII fields nulled or hashed
