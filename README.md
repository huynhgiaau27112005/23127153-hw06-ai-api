# HW06 - API Testing (EShop / Newman)

**Student:** Huynh Gia Au  
**Student ID:** 23127153  
**SUT:** [https://github.com/ttbhanh/eshop-sut](https://github.com/ttbhanh/eshop-sut) API @ `http://127.0.0.1:3010`  
**GitHub (this homework):** [https://github.com/huynhgiaau27112005/23127153-hw06-ai-api](https://github.com/huynhgiaau27112005/23127153-hw06-ai-api)

## Quick start

```powershell
cd 23127153_HW06_AI_API_100
npm install
powershell -ExecutionPolicy Bypass -File scripts/run-newman.ps1
# or: npm test
```

## Structure

- `data/test-cases/` - JSON matrices (35 cases x 3 APIs)
- `postman/` - collection + environment
- `reports/newman-report.html` - HTML output
- `.github/workflows/api-tests.yml` - CI
- `docs/` - main report, audit, critique, CI report, bugs

Header on all requests: `X-Student-Id: 23127153`

See `docs/main-report.md` for full methodology.
