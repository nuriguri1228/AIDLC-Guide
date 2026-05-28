# Frontend Components — `user-management`

> AIDLC Construction > Functional Design > Frontend specification
> Generated only when the unit has UI in scope (per `functional-design-plan` Q4).

## 1. Page Inventory

| Route | Page | Purpose | Auth |
|-------|------|---------|------|
| `/login` | `LoginPage` | Email + password entry, optional MFA | Public |
| `/signup` | `SignupPage` | New account creation | Public |
| `/forgot` | `ForgotPasswordPage` | Reset link request | Public |
| `/reset?token=...` | `ResetPasswordPage` | Set new password | Token-gated |
| `/profile` | `ProfilePage` | View / edit profile | Authenticated |
| `/security` | `SecurityPage` | Change password, manage MFA / passkeys | Authenticated |
| `/admin/users` | `AdminUserListPage` | Search and manage users | Admin role |
| `/admin/users/:id` | `AdminUserDetailPage` | View user audit, disable / re-enable | Admin role |

---

## 2. Component Hierarchy

```
AppShell
├── AuthGuard
│   ├── LoginPage
│   │   ├── EmailInput
│   │   ├── PasswordInput
│   │   ├── MFAChallenge (conditional)
│   │   └── SubmitButton
│   ├── ProfilePage
│   │   ├── ProfileForm
│   │   ├── AvatarUploader
│   │   └── SaveButton
│   └── SecurityPage
│       ├── PasswordChangeForm
│       ├── MFAManagement
│       └── PasskeyManagement
└── AdminGuard
    ├── AdminUserListPage
    │   ├── UserSearchBar
    │   ├── UserTable (paginated)
    │   └── BulkActionMenu
    └── AdminUserDetailPage
        ├── UserSummaryCard
        ├── AuditTimeline
        └── ActionPanel (disable / re-enable / delete)
```

---

## 3. Shared Components

| Component | Props | Behavior |
|-----------|-------|----------|
| `EmailInput` | `value`, `onChange`, `error?` | Validates format on blur |
| `PasswordInput` | `value`, `onChange`, `showStrength?`, `error?` | Strength meter when `showStrength` |
| `MFAChallenge` | `methods[]`, `onComplete(token)` | Multi-method (TOTP / WebAuthn / SMS) |
| `AuditTimeline` | `entries[]` | Reverse-chronological audit log viewer |

---

## 4. State Management

- **Tool**: Zustand (lightweight, no boilerplate)
- **Stores**:
  - `authStore` — `{ user, accessToken, refreshToken, login(), logout() }`
  - `profileStore` — `{ profile, isDirty, save(), reset() }`
  - `adminStore` — `{ filters, page, users, fetchUsers() }`

## 5. API Integration

| Endpoint | Component | Method |
|----------|-----------|--------|
| `POST /v1/auth/login` | `LoginPage` | Form submit |
| `POST /v1/auth/mfa/challenge` | `MFAChallenge` | After password ok |
| `GET /v1/me` | `ProfilePage` (on mount) | useQuery |
| `PATCH /v1/me` | `ProfilePage` | Form submit |
| `GET /v1/admin/users` | `AdminUserListPage` | useQuery with filters |
| `POST /v1/admin/users/:id/disable` | `AdminUserDetailPage` | Action button |

## 6. Accessibility

- All forms WCAG 2.1 AA compliant
- Keyboard navigation tested
- Screen reader labels on all interactive elements
- Color contrast ≥ 4.5:1

## 7. Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s on 3G |
| Time to Interactive | < 3s on 3G |
| Bundle size (gzipped) | < 250KB per route |
