# Contract Test Instructions

> AIDLC Construction > Build and Test > API contract testing
> Conditional artifact: generated when service-to-service contracts exist (microservices).

## 1. Goals

Verify that API contracts between services remain compatible. Catch breaking changes **before** they're deployed.

## 2. Tooling

- **Framework**: [Pact](https://docs.pact.io/) (consumer-driven contract testing)
- **Broker**: PactFlow (managed) or self-hosted Pact Broker
- **CI Integration**: GitHub Actions; results published per build

## 3. Contracts in Scope

| Consumer | Provider | Contract File |
|----------|----------|---------------|
| `apps.api` | `services.lending.underwriting` (gRPC) | `pacts/api-underwriting.json` |
| `apps.api` | `services.lending.disbursement` (gRPC) | `pacts/api-disbursement.json` |
| `apps.worker` | `services.notification` (HTTP) | `pacts/worker-notification.json` |
| `services.lending.origination` | `external.kyc-provider` (HTTP) | `pacts/origination-kyc.json` |

## 4. Workflow

### 4.1 Consumer Test (generates contract)

```python
# tests/contract/test_underwriting_consumer.py
from pact import Consumer, Provider

pact = Consumer('apps-api').has_pact_with(
    Provider('underwriting-service'),
    pact_dir='./pacts'
)

def test_score_application_returns_score():
    expected = {
        'app_id': 'app_123',
        'score': 720,
        'factors': [{'name': 'credit', 'weight': 0.4}]
    }
    (pact
     .given('application app_123 exists')
     .upon_receiving('a request to score application app_123')
     .with_request('POST', '/score', body={'app_id': 'app_123'})
     .will_respond_with(200, body=expected))

    with pact:
        result = UnderwritingClient(pact.uri).score('app_123')
    assert result.score == 720
```

### 4.2 Publish Contract

```bash
pact-broker publish ./pacts \
  --consumer-app-version $GIT_SHA \
  --broker-base-url $PACT_BROKER_URL \
  --broker-token $PACT_BROKER_TOKEN \
  --tag $GIT_BRANCH
```

### 4.3 Provider Verification

```python
# tests/contract/test_underwriting_provider.py
from pact import Verifier

def test_verify_against_consumer_contracts():
    verifier = Verifier(
        provider='underwriting-service',
        provider_base_url='http://localhost:8001'
    )
    success, _ = verifier.verify_with_broker(
        broker_url=PACT_BROKER_URL,
        broker_token=PACT_BROKER_TOKEN,
        publish_version=GIT_SHA,
        publish_verification_results=True,
        consumer_version_selectors=[
            {'tag': 'main', 'latest': True},
            {'tag': 'prod', 'latest': True}
        ]
    )
    assert success == 0
```

## 5. CI Pipeline Integration

| Stage | Job | Failure Action |
|-------|-----|----------------|
| Consumer build | run consumer tests, publish pact | block if test fails |
| Provider build | verify against broker | block deploy if verification fails |
| Pre-prod deploy | `can-i-deploy` check | block if any incompatible consumer |

## 6. `can-i-deploy` Check

```bash
pact-broker can-i-deploy \
  --pacticipant underwriting-service \
  --version $GIT_SHA \
  --to-environment prod
```

Exit code 0 = safe to deploy. Non-zero = consumer contracts would break.

## 7. Pass / Fail Criteria

- All consumer tests pass locally
- All provider verifications pass against latest tagged consumer pacts
- `can-i-deploy` returns 0 before any prod deploy
- Pact compatibility matrix shows green for all (consumer, provider) pairs in prod

## 8. Adding a New Contract

1. Write consumer test → run → pact generated
2. Publish pact to broker
3. Ensure provider has corresponding handler
4. Add provider verification step to provider CI
5. Validate `can-i-deploy` green before merging
