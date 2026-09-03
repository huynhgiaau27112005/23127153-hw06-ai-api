#!/usr/bin/env node
/**
 * HW06 — Build Postman collection from JSON test-case files.
 * Student: 23127153 — Huỳnh Gia Âu
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'postman', '23127153_EShop_API.postman_collection.json');

const COLLECTION_PREREQUEST = [
  "pm.request.headers.add({ key: 'X-Student-Id', value: '23127153' });",
].join('\n');

const TEST_STATUS_AND_BODY = [
  "const expected = pm.variables.get('expectedStatus');",
  "if (expected) {",
  "  pm.test('Status code matches matrix', () => pm.response.to.have.status(parseInt(expected, 10)));",
  "}",
  "const contains = pm.variables.get('expectedBodyContains');",
  "if (contains) {",
  "  JSON.parse(contains).forEach(fragment => {",
  "    pm.test('Body contains: ' + fragment, () => pm.expect(pm.response.text()).to.include(fragment));",
  "  });",
  "}",
  "pm.test('Response time under 5s', () => pm.expect(pm.response.responseTime).to.be.below(5000));",
].join('\n');

function parseUrl(method, raw) {
  const cleaned = raw.replace('{{baseUrl}}', '').split('?')[0];
  const pathParts = cleaned.split('/').filter(Boolean);
  return {
    raw: `{{baseUrl}}/${pathParts.join('/')}`,
    host: ['{{baseUrl}}'],
    path: pathParts,
  };
}

function makeRequest(tc) {
  const headers = [];
  const hdr = { ...(tc.headers || {}) };
  for (const [key, value] of Object.entries(hdr)) {
    headers.push({ key, value: String(value), type: 'text' });
  }

  const item = {
    name: `${tc.id} — ${tc.title}`,
    event: [
      {
        listen: 'prerequest',
        script: {
          exec: [
            `pm.variables.set('expectedStatus', '${tc.expectedStatus}');`,
            `pm.variables.set('expectedBodyContains', ${JSON.stringify(JSON.stringify(tc.expectedBodyContains || []))});`,
          ],
          type: 'text/javascript',
        },
      },
      {
        listen: 'test',
        script: { exec: TEST_STATUS_AND_BODY.split('\n'), type: 'text/javascript' },
      },
    ],
    request: {
      method: tc.method,
      header: headers,
      body:
        tc.body !== undefined && tc.body !== null && tc.method !== 'GET' && tc.method !== 'DELETE'
          ? { mode: 'raw', raw: JSON.stringify(tc.body, null, 2), options: { raw: { language: 'json' } } }
          : undefined,
      url: parseUrl(tc.method, `{{baseUrl}}${tc.endpoint}`),
      description: `Category: ${tc.category} | Audit: ${tc.auditLabel}\n\n${tc.notes || ''}\n\nPreconditions: ${(tc.preconditions || []).join('; ')}`,
    },
  };
  if (!item.request.body) delete item.request.body;
  return item;
}

function setupFolder() {
  return {
    name: '00 Setup',
    item: [
      {
        name: '[Setup] Login Test User',
        event: [{
          listen: 'test',
          script: {
            exec: [
              "pm.test('Setup: user login 200', () => pm.response.to.have.status(200));",
              "pm.environment.set('userToken', pm.response.json().token);",
            ],
            type: 'text/javascript',
          },
        }],
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: { mode: 'raw', raw: '{\n  "email": "{{userEmail}}",\n  "password": "{{userPassword}}"\n}' },
          url: parseUrl('POST', '{{baseUrl}}/api/login'),
        },
      },
      {
        name: '[Setup] Login Admin',
        event: [{
          listen: 'test',
          script: {
            exec: [
              "pm.test('Setup: admin login 200', () => pm.response.to.have.status(200));",
              "const j = pm.response.json();",
              "pm.environment.set('adminToken', j.token);",
              "if (j.user) pm.environment.set('adminUserId', String(j.user.id));",
            ],
            type: 'text/javascript',
          },
        }],
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: { mode: 'raw', raw: '{\n  "email": "{{adminEmail}}",\n  "password": "{{adminPassword}}"\n}' },
          url: parseUrl('POST', '{{baseUrl}}/api/login'),
        },
      },
      {
        name: '[Setup] Register Disposable User',
        event: [{
          listen: 'test',
          script: {
            exec: [
              "if (pm.response.code === 200) pm.environment.set('disposableUserId', String(pm.response.json().id));",
            ],
            type: 'text/javascript',
          },
        }],
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: { mode: 'raw', raw: '{\n  "name": "Disposable HW06",\n  "email": "{{disposableEmail}}",\n  "password": "Disp1234!"\n}' },
          url: parseUrl('POST', '{{baseUrl}}/api/register'),
        },
      },
      {
        name: '[Setup] Add Product to Cart',
        event: [{
          listen: 'test',
          script: { exec: ["pm.test('Setup: add to cart 200', () => pm.response.to.have.status(200));"], type: 'text/javascript' },
        }],
        request: {
          method: 'POST',
          header: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Authorization', value: 'Bearer {{userToken}}' },
          ],
          body: { mode: 'raw', raw: '{\n  "id": {{productId}},\n  "name": "{{productName}}",\n  "price": {{productPrice}},\n  "quantity": 1\n}' },
          url: parseUrl('POST', '{{baseUrl}}/api/cart'),
        },
      },
    ],
  };
}

function loadCases(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'test-cases', file), 'utf8'));
}

function main() {
  const pools = [
    { file: 'fr02-login-cases.json', folder: 'FR-02 Login', desc: 'POST /api/login — Pool A' },
    { file: 'fr08-checkout-cases.json', folder: 'FR-08 Checkout', desc: 'POST /api/checkout — Pool B' },
    { file: 'fr19-users-cases.json', folder: 'FR-19 Admin Users', desc: 'GET/DELETE /api/admin/users — Pool C' },
  ];

  let total = 0;
  const items = [setupFolder()];
  for (const pool of pools) {
    const cases = loadCases(pool.file);
    total += cases.length;
    items.push({
      name: pool.folder,
      description: pool.desc,
      item: cases.map((tc) => makeRequest(tc)),
    });
  }

  const collection = {
    info: {
      _postman_id: 'hw06-23127153-eshop-api',
      name: '23127153_EShop_API',
      description: 'HW06 API Testing — Huỳnh Gia Âu (23127153)\n\nPools: FR-02, FR-08, FR-19\nSUT: http://127.0.0.1:3010',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    event: [{ listen: 'prerequest', script: { type: 'text/javascript', exec: COLLECTION_PREREQUEST.split('\n') } }],
    variable: [{ key: 'baseUrl', value: 'http://127.0.0.1:3010' }],
    item: items,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(collection, null, 2) + '\n');
  console.log(`Built ${OUT} — ${total} test cases + 4 setup requests`);
}

main();
