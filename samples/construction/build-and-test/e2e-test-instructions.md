# E2E Test Instructions

> AIDLC Construction > Build and Test > End-to-end testing
> Conditional artifact: generated when E2E user workflows are in scope.

## 1. Goals

Validate complete user-facing workflows from UI through API through downstream systems. E2E tests answer "does the user's golden path work in a realistic environment?"

E2E tests are **NOT a substitute** for unit or integration tests — they're a thin layer on top covering critical paths.

## 2. Tooling

| Concern | Tool |
|---------|------|
| Browser automation | Playwright (TypeScript) |
| API-only E2E | pytest + httpx |
| Test data setup | Python seed scripts + DB factories |
| Recording / debugging | Playwright trace viewer |

## 3. Test Environment

E2E tests run against a **staging environment** that mirrors prod:
- Full deployment of every unit
- Real external integrations (KYC sandbox, payment sandbox, etc.)
- Fresh test data per run (DB seeded then torn down)

## 4. Scenarios

### 4.1 New User Signup → Login → First Action

```typescript
// tests/e2e/signup-login.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up, verify email, and login', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  // Signup
  await page.goto('/signup');
  await page.fill('[name=email]', email);
  await page.fill('[name=password]', 'StrongPass1!');
  await page.click('button:has-text("Sign up")');
  await expect(page.locator('text=Check your email')).toBeVisible();
  // Simulate email verification (test backdoor: API call to verify)
  const token = await getVerificationToken(email);
  await page.goto(`/verify?token=${token}`);
  await expect(page.locator('text=Verified')).toBeVisible();
  // Login
  await page.goto('/login');
  await page.fill('[name=email]', email);
  await page.fill('[name=password]', 'StrongPass1!');
  await page.click('button:has-text("Log in")');
  await expect(page).toHaveURL('/profile');
  await expect(page.locator(`text=${email}`)).toBeVisible();
});
```

### 4.2 Loan Application — Happy Path

```python
# tests/e2e/test_loan_application_happy.py
def test_application_submit_to_approval(api_client, seed_user, mock_kyc_approve, mock_ach_succeed):
    # 1. Submit application
    r = api_client.post('/v1/applications', json={
        'product_code': 'PERSONAL_36M',
        'requested_amount': 5000,
        'applicant': {'first_name': 'Test', 'last_name': 'User', 'annual_income': 60000, 'credit_score': 720}
    })
    assert r.status_code == 201
    app_id = r.json()['id']

    # 2. Wait for eligibility screening
    wait_for_status(api_client, app_id, 'underwriting', timeout=30)

    # 3. Submit underwriter decision
    r = api_client.post(f'/v1/applications/{app_id}/decisions',
        headers=staff_headers(),
        json={'decision': 'approve', 'approved_amount': 5000, 'interest_rate_bps': 950, 'term_months': 36})
    assert r.status_code == 201

    # 4. Trigger disbursement
    r = api_client.post(f'/v1/applications/{app_id}/disbursements', headers=staff_headers())
    assert r.status_code == 202

    # 5. Wait for disbursement complete
    wait_for_status(api_client, app_id, 'disbursed', timeout=60)
```

### 4.3 Admin User Management

```typescript
test('admin can disable a user', async ({ page, request }) => {
  const adminToken = await getAdminToken();
  const targetUserId = await createTestUser();

  await page.goto('/admin/users', { extraHTTPHeaders: { Authorization: `Bearer ${adminToken}` }});
  await page.fill('[placeholder="Search users..."]', targetUserId);
  await page.click(`text=${targetUserId}`);
  await page.click('button:has-text("Disable")');
  await page.click('button:has-text("Confirm")');

  await expect(page.locator('text=Status: disabled')).toBeVisible();
  // Verify via API
  const r = await request.get(`/v1/admin/users/${targetUserId}`, {
    headers: { Authorization: `Bearer ${adminToken}` }});
  expect((await r.json()).status).toBe('disabled');
});
```

## 5. Execution

```bash
# Setup
export E2E_BASE_URL=https://staging.users.example.com
export E2E_ADMIN_TOKEN=$(scripts/get_admin_token.sh)

# Playwright UI tests
npx playwright test tests/e2e

# Python API E2E
poetry run pytest tests/e2e -m e2e --maxfail=1

# Generate trace + screenshots for failures
npx playwright test --trace=on-first-retry
```

## 6. Test Data Lifecycle

1. **Setup**: each test creates its own unique user (timestamped email) — no shared state
2. **Isolation**: tests run in parallel where independent; serial when state interacts
3. **Teardown**: nightly job purges test users created in the last 24h (`email like 'e2e-%'`)

## 7. Pass / Fail Criteria

A E2E test run **PASSES** when:
- All scenarios pass on the first run (no flakes)
- Total runtime < 15 min
- No timeouts on critical assertions

Flaky tests (intermittent failures) must be:
1. Marked `@flaky` and tracked in a ticket
2. Investigated within 1 sprint
3. Either fixed or removed (don't leave in suite)

## 8. Schedule

| When | What |
|------|------|
| Per PR (against staging) | Smoke subset (5 scenarios, ~3 min) |
| Nightly | Full E2E suite (all scenarios) |
| Pre-prod release | Full E2E suite + manual exploratory QA |
