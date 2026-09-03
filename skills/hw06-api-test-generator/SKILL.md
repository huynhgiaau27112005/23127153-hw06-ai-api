---
name: hw06-api-test-generator
description: Generate JSON API test cases and Postman/Newman collections for EShop HW06 homework. Use when creating API test matrices, building Postman collections from JSON, or running Newman suites for FR-02/FR-08/FR-19.
---

# HW06 API Test Generator

Generate and maintain API test suites for EShop homework (Student 23127153 pattern).

## When to Use

- Creating new test cases for `POST /api/login`, `POST /api/checkout`, or admin user APIs
- Regenerating Postman collection after editing JSON cases
- Running Newman with HTML reports

## Prerequisites

- Node.js ≥ 18
- EShop SUT running at `http://127.0.0.1:3010`
- Seed accounts: `test@eshop.com`/`Test1234!`, `admin@eshop.com`/`Admin123!`

## Workflow

### 1. Add Test Cases

Edit files in `data/test-cases/`:

- `fr02-login-cases.json` — Pool A (FR-02)
- `fr08-checkout-cases.json` — Pool B (FR-08)
- `fr19-users-cases.json` — Pool C (FR-19)

Each case must include: `id`, `title`, `feature`, `method`, `endpoint`, `category`, `auditLabel`, `headers`, `body`, `expectedStatus`, `expectedBodyContains`, `notes`.

Audit labels: `VALID`, `INVALID`, `INCOMPLETE`, `EXT` (student extensions).

### 2. Build Collection

```bash
npm run build
# or
node scripts/build-postman-from-cases.js
```

Output: `postman/23127153_EShop_API.postman_collection.json`

### 3. Run Tests

```bash
npm test                    # full suite
npm run test:login          # FR-02 only
npm run test:checkout       # FR-08 only
npm run test:admin          # FR-19 only
```

PowerShell: `.\scripts\run-newman.ps1 -Folder "FR-02 Login"`

### 4. Export Matrix

```bash
npm run matrix
```

Output: `data/test-matrix.csv`

## Case ID Convention

| Prefix | Meaning |
|--------|---------|
| P## | Positive |
| N## | Negative |
| S## | Security |
| D## | Domain / schema |
| STU## | Student extension (EXT) |

## Collection Requirements

- Collection-level pre-request: `X-Student-Id: 23127153`
- Environment variable: `baseUrl = http://127.0.0.1:3010`
- Setup folder: login user, login admin, register disposable, add to cart

## Verifying Against SUT

Always cross-check expected status codes with `eshop-sut/backend/server.js` before committing case changes.

## AI Prompt Template

```
Read eshop-sut/api_specification.md section [N].
Generate [count] API test cases as JSON array with fields:
id, title, feature, method, endpoint, category, auditLabel,
preconditions, headers, body, expectedStatus, expectedBodyContains, notes.
Include 5 EXT student cases. Target audit split: VALID/INVALID/INCOMPLETE.
```

## Related Docs

- `docs/test-generator-design.md` — architecture and pseudocode
- `data/test-cases-audit.md` — label summary
- `docs/bugs.md` — known SUT defects
