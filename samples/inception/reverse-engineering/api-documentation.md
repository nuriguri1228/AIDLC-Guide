# API Documentation

> AIDLC Inception > Reverse Engineering > API surface analysis
> Generated for brownfield project.

## 1. External REST APIs (v1)

### 1.1 Applications

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| `POST` | `/v1/applications` | Submit a new loan application | JWT (customer or agent) |
| `GET`  | `/v1/applications/{id}` | Retrieve application by ID | JWT (owner or staff) |
| `GET`  | `/v1/applications?status=...` | List applications (paginated) | JWT (staff only) |
| `POST` | `/v1/applications/{id}/decisions` | Record underwriting decision | JWT (underwriter role) |
| `POST` | `/v1/applications/{id}/disbursements` | Trigger disbursement | JWT (operator role) |

### 1.2 Catalog

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| `GET`  | `/v1/products` | List active loan products | Public |
| `GET`  | `/v1/products/{code}` | Retrieve product details | Public |
| `POST` | `/v1/products` | Create new product | JWT (admin) |
| `PUT`  | `/v1/products/{code}` | Update product | JWT (admin) |

### 1.3 Health & Observability

| Method | Path | Purpose |
|--------|------|---------|
| `GET`  | `/healthz` | Liveness probe (returns 200 if process up) |
| `GET`  | `/readyz` | Readiness probe (checks DB, downstream services) |
| `GET`  | `/metrics` | Prometheus metrics endpoint |

---

## 2. Internal Service APIs (gRPC)

### 2.1 Underwriting Service

- **Service**: `lending.underwriting.v1.UnderwritingService`
- **Endpoint**: `underwriting-service.internal:50051`

| RPC | Request | Response |
|-----|---------|----------|
| `ScoreApplication` | `ScoreRequest { app_id, applicant_data }` | `ScoreResponse { score, factors[] }` |
| `EligibilityCheck` | `EligibilityRequest { app_id }` | `EligibilityResponse { eligible, reasons[] }` |

### 2.2 Disbursement Service

- **Service**: `lending.disbursement.v1.DisbursementService`
- **Endpoint**: `disbursement-service.internal:50052`

| RPC | Request | Response |
|-----|---------|----------|
| `InitiateACH` | `ACHRequest { app_id, amount, routing }` | `ACHResponse { transaction_id, status }` |

---

## 3. Data Models (key DTOs)

### 3.1 Application

```json
{
  "id": "app_01HXYZ...",
  "applicant": {
    "first_name": "string",
    "last_name": "string",
    "ssn_last4": "string",
    "annual_income": 75000.00,
    "credit_score": 720
  },
  "product_code": "PERSONAL_36M",
  "requested_amount": 15000.00,
  "status": "submitted | screening | underwriting | approved | declined | disbursed",
  "created_at": "2026-01-15T10:23:00Z",
  "updated_at": "2026-01-15T10:23:00Z"
}
```

### 3.2 Decision

```json
{
  "id": "dec_01HXYZ...",
  "application_id": "app_01HXYZ...",
  "decision": "approve | decline | needs_info",
  "decided_by": "user_01HXYZ...",
  "reasons": ["DTI within range", "Credit score acceptable"],
  "approved_amount": 15000.00,
  "interest_rate_bps": 945,
  "term_months": 36,
  "decided_at": "2026-01-15T11:42:00Z"
}
```

---

## 4. Webhook Subscriptions (outbound)

| Event | Topic | Consumer |
|-------|-------|----------|
| `application.submitted` | `lending.app.events` | Notification service, Analytics |
| `application.approved` | `lending.app.events` | Notification service, ACH service |
| `application.declined` | `lending.app.events` | Notification service |
| `disbursement.completed` | `lending.disbursement.events` | Accounting service |

---

## 5. Error Response Format

All endpoints return RFC 7807 Problem Details on error:

```json
{
  "type": "https://lending.example.com/errors/validation",
  "title": "Validation Failed",
  "status": 400,
  "detail": "annual_income must be > 0",
  "instance": "/v1/applications",
  "errors": [
    { "field": "applicant.annual_income", "code": "invalid_value" }
  ]
}
```
