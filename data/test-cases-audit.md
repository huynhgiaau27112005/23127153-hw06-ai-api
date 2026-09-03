# Test Cases Audit Summary — HW06

**Student:** Huỳnh Gia Âu (23127153)  
**Generated:** 2026-08-30

## Label Definitions

| Label | Meaning |
|-------|---------|
| **VALID** | Positive / expected-success scenario with complete automation |
| **INVALID** | Negative input or auth failure — expects 4xx |
| **INCOMPLETE** | Requires multi-step state or manual verification |
| **EXT** | Student-authored extension cases (5 per pool) |

## Pool A — FR-02 Login (`fr02-login-cases.json`)

| Audit Label | Count |
|-------------|-------|
| VALID | 12 |
| INVALID | 16 |
| INCOMPLETE | 2 |
| EXT | 5 |
| **Total** | **35** |

Categories: positive (5), negative (10), security (6), schema (8), domain (6), state (2), EXT (5).

## Pool B — FR-08 Checkout (`fr08-checkout-cases.json`)

| Audit Label | Count |
|-------------|-------|
| VALID | 14 |
| INVALID | 4 |
| INCOMPLETE | 12 |
| EXT | 5 |
| **Total** | **35** |

Categories: positive (5), negative (8), security (6), schema (8), domain (6), state (4), EXT (5).

Notable INCOMPLETE cases: tampered totals (business-logic gaps), double checkout, empty cart.

## Pool C — FR-19 Admin Users (`fr19-users-cases.json`)

| Audit Label | Count |
|-------------|-------|
| VALID | 10 |
| INVALID | 8 |
| INCOMPLETE | 12 |
| EXT | 5 |
| **Total** | **35** |

Categories: positive (7), negative (5), security (5), schema (6), domain (7), state (5), EXT (5).

Notable INCOMPLETE cases: IDOR gaps (regular user accessing admin APIs), admin self-delete.

## Grand Total

| Label | FR-02 | FR-08 | FR-19 | Sum |
|-------|-------|-------|-------|-----|
| VALID | 12 | 14 | 10 | 36 |
| INVALID | 16 | 4 | 8 | 28 |
| INCOMPLETE | 2 | 12 | 12 | 26 |
| EXT | 5 | 5 | 5 | 15 |
| **Total** | **35** | **35** | **35** | **105** |

## AI vs Student Authorship

- **AI-generated base:** ~90 cases (pools A/B/C core matrices)
- **Student EXT:** 15 cases (`FR02-STU01`–`STU05`, `FR08-STU01`–`STU05`, `FR19-STU01`–`STU05`)
- All cases reviewed and adjusted against `eshop-sut/api_specification.md` and live SUT behavior

## Review Checklist

- [x] Each pool ≥ 30 cases
- [x] Audit labels assigned per case
- [x] 5 EXT cases per pool
- [x] Seed credentials match SUT database
- [x] Collection built via `scripts/build-postman-from-cases.js`
- [x] `X-Student-Id: 23127153` on all requests
