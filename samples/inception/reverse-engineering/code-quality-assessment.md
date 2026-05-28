# Code Quality Assessment

> AIDLC Inception > Reverse Engineering > Code quality analysis
> Generated for brownfield project. Quantitative + qualitative findings.

## 1. Overall Health Score

| Dimension | Score | Target | Status |
|-----------|-------|--------|--------|
| Test coverage | 78% | ≥ 80% | 🟡 Just below |
| Type completeness (mypy strict) | 96% | 100% | 🟢 Good |
| Linter findings | 12 warnings | 0 | 🟡 Cleanup needed |
| Cyclomatic complexity (avg) | 4.2 | < 10 | 🟢 Good |
| Cyclomatic complexity (max) | 18 | < 20 | 🟢 Acceptable |
| Documentation coverage | 64% | ≥ 80% | 🔴 Below target |
| Dead code (vulture) | 47 items | < 10 | 🔴 Cleanup needed |

---

## 2. Test Coverage by Package

| Package | Lines | Covered | % |
|---------|-------|---------|---|
| `services.lending.origination` | 1,420 | 1,206 | **85%** |
| `services.lending.underwriting` | 980 | 608 | **62%** ⚠ |
| `services.lending.disbursement` | 740 | 612 | 83% |
| `services.lending.servicing` | 1,120 | 952 | 85% |
| `services.catalog.products` | 580 | 528 | 91% |
| `services.shared.auth` | 320 | 269 | 84% |
| `services.shared.persistence` | 410 | 348 | 85% |
| `apps.api` | 890 | 605 | 68% ⚠ |
| `apps.worker` | 510 | 408 | 80% |

**Hot spots**:
- `services.lending.underwriting` (62%) — external ML service mocking incomplete
- `apps.api` (68%) — many routes lack integration tests

---

## 3. Code Smells & Tech Debt

### High priority
1. **`state_machine.transition()` complexity = 18** — extract per-state handlers
2. **47 dead-code findings** — concentrated in `services.lending.servicing.legacy/`
3. **Missing docstrings on public API** in `services.lending.underwriting`

### Medium priority
1. Some `async def` functions use sync I/O (4 occurrences) — wrap with `asyncio.to_thread`
2. SQL N+1 patterns in `applications.list_for_status()` — needs query optimization
3. Inconsistent error response shape between `apps.api/routes/applications.py` and `routes/catalog.py`

### Low priority
1. `flask` legacy CLI tool in `tools/admin_cli.py` — port to Typer
2. Mixed `print()` / `logging` usage in worker tasks

---

## 4. Security Scan Findings

| Severity | Count | Notes |
|----------|-------|-------|
| Critical | 0 | — |
| High | 1 | `pyjwt` < 2.7.x CVE-2024-XXXXX — **already upgraded to 2.8.x in main** |
| Medium | 3 | `Bandit B608` SQL string concatenation in legacy reporter module |
| Low | 12 | Mostly `Bandit B311` (insecure random) in test fixtures — acceptable |

---

## 5. Dependency Health

- **Outdated minor versions**: 4 packages (acceptable, scheduled monthly upgrade)
- **Outdated major versions**: 0
- **Known vulnerabilities**: 0 (after recent upgrades)
- **Unused dependencies**: 2 (`requests`, `flask`) — flagged for removal

---

## 6. Maintainability Indicators

| Indicator | Value |
|-----------|-------|
| Average file length | 168 lines |
| Files > 500 lines | 4 |
| Average function length | 14 lines |
| Functions > 50 lines | 9 |
| Module fan-in (max) | 12 (`services.shared.persistence`) |
| Module fan-out (max) | 8 (`apps.api/main.py`) |

---

## 7. Recommendations Summary

1. Boost `apps.api` and `underwriting` test coverage to ≥ 80%
2. Refactor `state_machine.transition()` to reduce complexity
3. Document public functions in `underwriting` (mypy + docstrings)
4. Remove legacy `flask` CLI and unused deps
5. Standardize error response shape across all routes
