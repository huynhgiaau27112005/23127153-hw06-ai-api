# AI Critique — HW06 API Testing

**Student:** Huỳnh Gia Âu (23127153)

Using Cursor AI to bootstrap API test cases for EShop significantly accelerated the initial matrix design. Within one session, the agent produced roughly ninety structured JSON cases across three functional pools, covering positive paths, schema validation, security payloads, and domain partitions. The AI correctly inferred HTTP methods and endpoints from `api_specification.md` and suggested realistic negative inputs such as SQL injection strings and tampered checkout totals.

However, the raw AI output required substantial human correction. The model initially assumed `Admin1234!` as the admin password, while the SUT seed uses `Admin123!`—a mismatch caught only by reading `database.js`. Several expected status codes were wrong: the AI predicted 400 for missing login fields, but the server returns 401. Security cases labeled as failures actually expose real defects (missing admin role checks, unchecked `total_amount`), so I relabeled them INCOMPLETE rather than INVALID to distinguish spec intent from actual behavior.

The build script generation was the strongest AI contribution. Describing the desired Postman structure produced a working `build-postman-from-cases.js` with prerequest hooks for login and cart setup. I still had to fix asynchronous `pm.sendRequest` ordering for checkout tests. Student extension cases (whitespace emails, newline addresses, content-type negotiation) were entirely manual—AI suggestions were too generic until I provided concrete boundary ideas.

## Reflection (tiếng Việt)

Điểm quan trọng nhất mình rút ra: **AI giỏi liệt kê equivalence class, nhưng oracle (expected status) phải đối chiếu với `server.js`**. Nhiều case “fail” trên Newman thực ra là bug thật của SUT (IDOR admin, price tampering), không phải test sai. Workflow hiệu quả với mình: AI generate → mình đọc seed/password → Newman chạy trên port 3010 sau `reset-eshop-api` → ghi bug + label VALID/INVALID/INCOMPLETE/EXT trong audit.

Overall, AI served as a capable drafting assistant for breadth, not depth. It excels at enumerating equivalence classes but cannot replace executing tests against the live SUT.
