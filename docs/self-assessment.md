# Self-Assessment — HW06 API Testing

**Student:** Huỳnh Gia Âu | **MSSV:** 23127153

## Rubric Scores

| # | Criterion | Weight | Self Score (1–5) | Justification |
|---|-----------|--------|------------------|---------------|
| 1 | Test case quantity (≥30/pool) | 15% | 5 | 35 cases × 3 pools = 105 total |
| 2 | Test case quality & diversity | 20% | 4 | Positive, negative, security, schema, domain, state, EXT |
| 3 | Audit labeling (VALID/INVALID/INCOMPLETE/EXT) | 10% | 5 | All cases labeled; summary in `data/test-cases-audit.md` |
| 4 | Newman automation | 20% | 4 | Full collection with setup folder, prerequest hooks, assertions |
| 5 | CI/CD integration | 10% | 4 | GitHub Actions with `workflow_dispatch` + `fail_one_test` |
| 6 | AI audit trail | 10% | 5 | 12 documented interactions in `docs/ai-audit.md` |
| 7 | Bug documentation | 5% | 4 | 6 defects logged in `docs/bugs.md` |
| 8 | Documentation & structure | 10% | 4 | README, reports, skill, CI report |

**Weighted average:** 4.4 / 5

## Strengths

- JSON-first test design with reproducible Postman generation
- Collection-level `X-Student-Id: 23127153` header on every request
- Security tests expose real SUT vulnerabilities (IDOR, price tampering)
- 15 student-authored EXT cases with domain-specific boundaries

## Areas for Improvement

- Some INCOMPLETE state-dependent cases fail in full sequential Newman runs
- Async `pm.sendRequest` prerequest scripts may race under load
- CI workflow assumes sibling `eshop-sut` repo path — fragile in isolation
- Could add JSON Schema validation tests for response bodies

## Learning Outcomes

1. Understood JWT auth flow and how to automate token refresh in Postman
2. Learned to verify AI-generated expected values against actual server code
3. Practiced CI/CD for API tests with Newman and artifact upload
4. Documented defects with severity and reproduction steps

## Honesty Statement

AI (Cursor) assisted in generating initial test matrices and the build script. All expected status codes were verified against `eshop-sut/backend/server.js`. Student extension cases and audit review were performed manually.
