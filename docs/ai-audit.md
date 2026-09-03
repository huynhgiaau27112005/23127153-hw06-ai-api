# AI Audit Trail — HW06 API Testing

**Student:** Huỳnh Gia Âu (23127153)  
**Tool:** Cursor AI Agent  
**Date range:** 2026-08-28 — 2026-08-30

## Interaction Log (12 entries)

| # | Date | Prompt / Action | AI Output | Student Action |
|---|------|-----------------|-----------|----------------|
| 1 | 08-28 | "Generate FR-02 login test matrix from api_specification.md" | 30 positive/negative/security cases | Reviewed expected status codes against server.js |
| 2 | 08-28 | "Add boundary cases for email/password partitions" | FR02-D01–D10 domain cases | Kept 8, merged 2 duplicates |
| 3 | 08-28 | "Generate FR-08 checkout cases including cart preconditions" | 30 checkout scenarios | Adjusted total_amount to match AirPods price |
| 4 | 08-29 | "Add security tests: SQLi, XSS, tampered total" | FR08-S01–S05 | Confirmed SUT accepts tampered totals → INCOMPLETE label |
| 5 | 08-29 | "Generate FR-19 admin user management tests" | GET/DELETE matrix | Added IDOR cases after reading authenticateToken middleware |
| 6 | 08-29 | "Write build-postman-from-cases.js generator" | Node script with prerequest hooks | Tested locally, fixed async cart setup |
| 7 | 08-29 | "Add 5 student extension cases per pool" | STU01–STU05 per FR | Authored Vietnamese email, newline address, trailing slash tests |
| 8 | 08-30 | "Assign audit labels VALID/INVALID/INCOMPLETE/EXT" | Label mapping function | Manual review of 12 INCOMPLETE state-dependent cases |
| 9 | 08-30 | "Create GitHub Actions workflow with fail_one_test input" | api-tests.yml | Added workflow_dispatch choice input |
| 10 | 08-30 | "Generate ai-critique and self-assessment docs" | 250-word critique draft | Expanded with specific bug references |
| 11 | 08-30 | "Fix admin password — seed uses Admin123! not Admin1234!" | Corrected environment file | Verified against database.js seed |
| 12 | 08-30 | "Run full Newman suite on port 3010" | Collection build + test execution | Recorded pass/fail in main-report |

## Authorship Split

| Source | Cases | Percentage |
|--------|-------|------------|
| AI-generated (reviewed) | ~90 | ~86% |
| Student EXT (STU01–05 × 3) | 15 | ~14% |
| Manual edits to expected values | ~25 | — |

## Verification Steps Taken

1. Cross-referenced every expected status with `eshop-sut/backend/server.js`
2. Ran `npm run build` after each case file change
3. Spot-checked 10 random cases in Postman GUI
4. Documented discrepancies in `docs/bugs.md`

## Prompt Templates Used

```
Given API spec section [X], generate N test cases as JSON with fields:
id, title, feature, method, endpoint, category, auditLabel, preconditions,
headers, body, expectedStatus, expectedBodyContains, notes
```

```
Convert JSON cases to Postman v2.1 collection with collection-level
pre-request: X-Student-Id: 23127153
```

## Files Produced via AI

- `data/test-cases/*.json`
- `scripts/build-postman-from-cases.js`
- `postman/23127153_EShop_API.postman_collection.json` (generated)
- `docs/*.md`
- `skills/hw06-api-test-generator/SKILL.md`
- `.github/workflows/api-tests.yml`
