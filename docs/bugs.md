# Bug Log — EShop API (HW06)

**Student:** Huỳnh Gia Âu (23127153)  
**SUT:** EShop API `http://127.0.0.1:3010`

## BUG-01: No admin role check on admin endpoints

| Field | Value |
|-------|-------|
| **Severity** | High |
| **FR** | FR-19 |
| **Test cases** | FR19-S01, FR19-S02 |
| **Steps** | 1. Login as `test@eshop.com` 2. `GET /api/admin/users` or `DELETE /api/admin/users/:id` |
| **Expected** | 403 Forbidden for non-admin |
| **Actual** | 200 OK — regular user can list and delete users |
| **Root cause** | `authenticateToken` middleware checks JWT validity only, not `req.user.role` |

## BUG-02: Checkout accepts client-supplied total_amount

| Field | Value |
|-------|-------|
| **Severity** | High |
| **FR** | FR-08 |
| **Test cases** | FR08-S01, FR08-N06 |
| **Steps** | 1. Add 6M item to cart 2. Checkout with `total_amount: 1` |
| **Expected** | 400 — total must match cart |
| **Actual** | 200 — order created with tampered amount |
| **Root cause** | Server inserts `total_amount` from request body without validation |

## BUG-03: Login response includes plaintext password

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **FR** | FR-02 |
| **Test cases** | FR02-P03 |
| **Steps** | `POST /api/login` with valid credentials |
| **Expected** | User object without password field |
| **Actual** | Full user row returned including `password` |
| **Root cause** | `res.json({ token, user })` sends entire DB row |

## BUG-04: Delete non-existent user returns 200

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **FR** | FR-19 |
| **Test cases** | FR19-N05, FR19-D07 |
| **Steps** | `DELETE /api/admin/users/999999` |
| **Expected** | 404 Not Found |
| **Actual** | 200 `{ message: "User deleted" }` even when `changes === 0` |
| **Root cause** | No check on `this.changes` after DELETE |

## BUG-05: Empty cart still allows checkout

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **FR** | FR-08 |
| **Test cases** | FR08-N08 |
| **Steps** | Login with empty cart, `POST /api/checkout` |
| **Expected** | 400 — cart is empty |
| **Actual** | 200 — order created with no items |
| **Root cause** | Checkout does not read `userCarts` |

## BUG-06: JWT secret hardcoded in source

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **FR** | FR-02 (security) |
| **Test cases** | FR02-P04 |
| **Steps** | Inspect `server.js` line 9 |
| **Expected** | Secret from environment variable |
| **Actual** | `SECRET_KEY = "super_secret_key_that_should_not_be_here"` |
| **Root cause** | Development shortcut left in production code |

## Summary

| Severity | Count |
|----------|-------|
| High | 2 |
| Medium | 3 |
| Low | 1 |

_All bugs confirmed via Newman test execution and manual verification._
