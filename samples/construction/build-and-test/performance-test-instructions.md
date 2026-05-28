# Performance Test Instructions

> AIDLC Construction > Build and Test > Performance testing
> Conditional artifact: generated when performance NFRs exist.

## 1. Goals

Validate that the system meets the performance NFRs documented in `nfr-requirements.md`:

| NFR | Target |
|-----|--------|
| Throughput | 500 req/s sustained |
| P50 latency | ≤ 80 ms |
| P95 latency | ≤ 150 ms |
| P99 latency | ≤ 200 ms |
| Error rate | < 0.1% during load |
| Memory headroom | < 70% peak |

## 2. Tooling

- **Load generator**: [k6](https://k6.io/) v0.49+
- **Metrics target**: CloudWatch Metrics + Prometheus
- **Profiling**: py-spy (CPU), tracemalloc (memory) for app-side analysis

## 3. Test Environment

| Resource | Configuration |
|----------|---------------|
| Compute | 6 ECS Fargate tasks (2 per AZ), 1 vCPU / 2 GB each |
| DB | RDS db.r6g.large multi-AZ (mirror of prod sizing) |
| Cache | ElastiCache 2× cache.r6g.large |
| Load source | EC2 m5.4xlarge in same VPC (eliminate WAN latency) |

> **Important**: Performance tests must run against a **staging** environment that mirrors prod sizing. Never run against prod.

## 4. Test Scenarios

### 4.1 Baseline (steady-state)

```javascript
// tests/performance/baseline.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    steady: {
      executor: 'constant-arrival-rate',
      rate: 500, timeUnit: '1s',
      duration: '10m',
      preAllocatedVUs: 100, maxVUs: 200
    }
  },
  thresholds: {
    'http_req_duration{status:200}': ['p(50)<80', 'p(95)<150', 'p(99)<200'],
    'http_req_failed': ['rate<0.001']
  }
};

export default function () {
  const r = http.get(`${__ENV.BASE_URL}/v1/users/me`,
    { headers: { Authorization: `Bearer ${__ENV.TOKEN}` } });
  check(r, { 'status 200': (res) => res.status === 200 });
}
```

### 4.2 Burst (spike test)

- Ramp from 0 → 1500 req/s over 30s
- Hold for 2 min
- Ramp down to 0 over 30s
- **Expectation**: autoscaling kicks in, P99 stays < 500ms during ramp

### 4.3 Soak (endurance)

- 300 req/s for 4 hours
- **Expectation**: no memory leak, no degradation, error rate < 0.05%

### 4.4 Stress (breaking-point)

- Ramp 100 → 2000 req/s over 20 min
- **Find**: throughput at which P99 > 1s or error rate > 1%
- **Document**: breaking point and bottleneck (CPU? DB? cache?)

## 5. Execution

```bash
# 1. Provision staging env to prod sizing
cd infra && cdk deploy --context env=perf-test --require-approval never

# 2. Seed data (10k users, 100k events)
poetry run python scripts/seed_perf_data.py

# 3. Run baseline test
BASE_URL=https://staging.users.example.com \
TOKEN=$(get-staging-token) \
k6 run tests/performance/baseline.js --out cloud

# 4. Run spike test
k6 run tests/performance/spike.js --out cloud

# 5. Run soak test (long — schedule overnight)
k6 run tests/performance/soak.js --out cloud

# 6. Generate report
k6 cloud results <test-id> --format html > perf-report.html
```

## 6. Pass / Fail Criteria

A performance test run **PASSES** when:
- All k6 thresholds green
- CloudWatch ApplicationELB 5xx count = 0 during baseline
- RDS CPU < 70% at steady state
- Cache hit rate > 85%

## 7. Tear-Down

```bash
cd infra && cdk destroy --context env=perf-test
```

## 8. Artifacts

| File | Purpose |
|------|---------|
| `tests/performance/*.js` | k6 scripts |
| `tests/performance/seed_perf_data.py` | Test data seeder |
| `perf-report-{timestamp}.html` | k6 HTML report (uploaded to S3 after each run) |
