# Security Test Instructions

> AIDLC Construction > Build and Test > Security testing
> Conditional artifact: generated when security NFRs exist.

## 1. Goals

Verify the application meets the security NFRs in `nfr-requirements.md`:

- No HIGH/CRITICAL CVEs in dependencies
- No HIGH/CRITICAL SAST findings
- No exposed secrets in code or images
- Authentication / authorization rules enforced
- Input validation rejects malicious payloads

## 2. Test Categories & Tools

| Category | Tool |
|----------|------|
| SAST (static) | Bandit + Semgrep |
| Dependency scan | Safety + pip-audit |
| Container scan | Trivy + ECR scan |
| Secret scan | gitleaks |
| IaC scan | Checkov |
| DAST (dynamic) | OWASP ZAP baseline |
| Auth/Authz tests | pytest (per-route fixtures) |
| Fuzz tests | Hypothesis (property-based) |

## 3. Execution

### 3.1 SAST

```bash
# Bandit — Python security linter
poetry run bandit -r src -ll  # only LOW+ findings

# Semgrep — multi-language with OWASP/CWE rulesets
semgrep --config=auto --error src
```

### 3.2 Dependency Scan

```bash
poetry run safety check --json
poetry run pip-audit --strict
```

### 3.3 Container Scan

```bash
# After docker build
trivy image --severity HIGH,CRITICAL --exit-code 1 \
  $ECR_REGISTRY/user-management:$GIT_SHA
```

### 3.4 Secret Scan (pre-commit + CI)

```bash
gitleaks detect --redact -v
```

### 3.5 IaC Scan

```bash
checkov -d infra/ --soft-fail false --quiet
```

### 3.6 DAST (against staging)

```bash
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.users.example.com \
  -r zap-report.html
```

### 3.7 Authentication / Authorization Tests

```python
# tests/security/test_authz.py
@pytest.mark.parametrize("path,method,required_role", [
    ("/v1/admin/users", "GET", "admin"),
    ("/v1/admin/users/123/disable", "POST", "admin"),
    ("/v1/me", "GET", None),  # any authenticated
])
def test_route_enforces_role(path, method, required_role, client):
    # Without auth → 401
    assert client.request(method, path).status_code == 401
    # With wrong role → 403
    if required_role:
        wrong = make_token(role="user")
        assert client.request(method, path, headers={"Authorization": f"Bearer {wrong}"}).status_code == 403
    # With right role → 200/2xx
    right = make_token(role=required_role or "user")
    assert client.request(method, path, headers={"Authorization": f"Bearer {right}"}).status_code < 400
```

### 3.8 Fuzz Tests

```python
from hypothesis import given, strategies as st

@given(st.text(min_size=0, max_size=10000))
def test_email_field_never_crashes(s):
    # Should reject invalid but never raise unexpected exceptions
    try:
        UserCreateModel(email=s, password="ValidPass123!")
    except (ValidationError, ValueError):
        pass  # expected
```

## 4. Pass / Fail Criteria

A security test run **PASSES** when:
- Bandit: 0 HIGH severity
- Semgrep: 0 ERROR severity
- Safety / pip-audit: 0 known CVEs
- Trivy: 0 HIGH/CRITICAL in container image
- gitleaks: 0 secrets detected
- Checkov: 0 HIGH severity
- ZAP baseline: 0 HIGH risk alerts
- All authz tests pass
- Fuzz tests run for 5 min without uncaught exceptions

## 5. Vulnerability Triage

When a HIGH/CRITICAL is found:
1. Determine exploitability (is the affected code path reachable?)
2. If exploitable → block release, patch immediately
3. If not exploitable → file ticket, plan remediation, suppress with justification
4. Document in `aidlc-docs/construction/build-and-test/security-suppressions.md`

## 6. Required Pre-Prod Gate

The following must be green before any prod deploy:
- [ ] SAST clean
- [ ] Dependency scan clean
- [ ] Container scan clean
- [ ] No secrets in image
- [ ] DAST baseline clean (run nightly against staging)
- [ ] Auth/Authz integration tests pass
