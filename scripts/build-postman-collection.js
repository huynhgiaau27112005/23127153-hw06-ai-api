#!/usr/bin/env node
/**
 * Build Postman collection from data/test-cases/*.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'postman', '23127153_EShop_API.postman_collection.json');

const COLLECTION_PREREQUEST = [
  "pm.request.headers.upsert({ key: 'X-Student-Id', value: pm.environment.get('studentId') || '23127153' });",
  "pm.request.headers.upsert({ key: 'Content-Type', value: 'application/json' });",
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

function makeRequest(tc, folderVars = {}) {
  const url = `{{baseUrl}}${tc.endpoint.replace(/\{\{(\w+)\}\}/g, '{{$1}}')}`;
  const headers = [];
  const hdr = { ...(tc.headers || {}) };
  if (hdr.Authorization && hdr.Authorization.includes('{{userToken}}')) {
    hdr.Authorization = 'Bearer {{userToken}}';
  }
  if (hdr.Authorization && hdr.Authorization.includes('{{adminToken}}')) {
    hdr.Authorization = 'Bearer {{adminToken}}';
  }
  if (hdr.Authorization && hdr.Authorization.includes('{{otherUserToken}}')) {
    hdr.Authorization = 'Bearer {{otherUserToken}}';
  }
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
            ...Object.entries(folderVars).map(([k, v]) => `pm.variables.set('${k}', '${v}');`),
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
        tc.body !== undefined && tc.body !== null && tc.method !== 'GET'
          ? { mode: 'raw', raw: JSON.stringify(tc.body, null, 2), options: { raw: { language: 'json' } } }
          : undefined,
      url: parseUrl(tc.method, url),
      description: `Category: ${tc.category} | Audit: ${tc.auditLabel}\n\n${tc.notes || ''}\n\nPreconditions: ${(tc.preconditions || []).join('; ')}`,
    },
  };
  if (!item.request.body) delete item.request.body;
  return item;
}

function parseUrl(method, raw) {
  const cleaned = raw.replace('{{baseUrl}}', '').split('?')[0];
  const parts = cleaned.split('/').filter(Boolean);
  const pathParts = parts.map((p) => (p.startsWith('{{') ? p : p));
  return {
    raw: `{{baseUrl}}/${pathParts.join('/')}`,
    host: ['{{baseUrl}}'],
    path: pathParts,
  };
}

function setupFolder() {
  return {
    name: '00 Setup',
    item: [
      {
        name: 'Login User (save token)',
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                "pm.test('Login OK', () => pm.response.to.have.status(200));",
                "const j = pm.response.json();",
                "pm.environment.set('userToken', j.token);",
              ],
              type: 'text/javascript',
            },
          },
        ],
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: {
            mode: 'raw',
            raw: '{\n  "email": "{{userEmail}}",\n  "password": "{{userPassword}}"\n}',
          },
          url: parseUrl('POST', '{{baseUrl}}/api/login'),
        },
      },
      {
        name: 'Login Admin (save token)',
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                "pm.test('Admin login OK', () => pm.response.to.have.status(200));",
                "pm.environment.set('adminToken', pm.response.json().token);",
              ],
              type: 'text/javascript',
            },
          },
        ],
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: {
            mode: 'raw',
            raw: '{\n  "email": "{{adminEmail}}",\n  "password": "{{adminPassword}}"\n}',
          },
          url: parseUrl('POST', '{{baseUrl}}/api/login'),
        },
      },
      {
        name: 'Register Disposable User',
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                "if (pm.response.code === 200) {",
                "  pm.environment.set('disposableUserId', pm.response.json().id);",
                "}",
              ],
              type: 'text/javascript',
            },
          },
        ],
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: {
            mode: 'raw',
            raw:
              '{\n  "name": "Disposable HW06",\n  "email": "{{disposableEmail}}",\n  "password": "Disp1234!"\n}',
          },
          url: parseUrl('POST', '{{baseUrl}}/api/register'),
        },
      },
      {
        name: 'Add Product to Cart',
        event: [
          {
            listen: 'prerequest',
            script: {
              exec: ["if (!pm.environment.get('userToken')) { throw new Error('Run Login User first'); }"],
              type: 'text/javascript',
            },
          },
          {
            listen: 'test',
            script: {
              exec: ["pm.test('Added to cart', () => pm.response.to.have.status(200));"],
              type: 'text/javascript',
            },
          },
        ],
        request: {
          method: 'POST',
          header: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Authorization', value: 'Bearer {{userToken}}' },
          ],
          body: {
            mode: 'raw',
            raw:
              '{\n  "id": {{productId}},\n  "name": "{{productName}}",\n  "price": {{productPrice}},\n  "quantity": 1\n}',
          },
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
  const loginCases = loadCases('fr02-login.json');
  const checkoutCases = loadCases('fr08-checkout.json');
  const adminCases = loadCases('fr19-admin-users.json');

  const collection = {
    info: {
      _postman_id: '23127153-eshop-api-hw06',
      name: '23127153_EShop_API',
      description:
        'HW06 API Testing — Huỳnh Gia Âu (23127153)\n\nPools: FR-02 Login, FR-08 Checkout, FR-19 Admin Users\nSUT: EShop @ http://127.0.0.1:3001',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    event: [
      {
        listen: 'prerequest',
        script: { type: 'text/javascript', exec: COLLECTION_PREREQUEST.split('\n') },
      },
    ],
    variable: [
      { key: 'baseUrl', value: 'http://127.0.0.1:3001' },
      { key: 'studentId', value: '23127153' },
    ],
    item: [
      setupFolder(),
      {
        name: 'FR-02 Login',
        description: 'POST /api/login — Pool A',
        item: loginCases.map((tc) => makeRequest(tc)),
      },
      {
        name: 'FR-08 Checkout',
        description: 'POST /api/checkout with cart setup — Pool B',
        item: [
          {
            name: 'Pre-check: ensure user logged in & cart ready',
            event: [
              {
                listen: 'prerequest',
                script: {
                  exec: [
                    "if (!pm.environment.get('userToken')) {",
                    "  pm.sendRequest({",
                    "    url: pm.environment.get('baseUrl') + '/api/login',",
                    "    method: 'POST',",
                    "    header: { 'Content-Type': 'application/json', 'X-Student-Id': pm.environment.get('studentId') },",
                    "    body: { mode: 'raw', raw: JSON.stringify({ email: pm.environment.get('userEmail'), password: pm.environment.get('userPassword') }) }",
                    "  }, (err, res) => { pm.environment.set('userToken', res.json().token); });",
                    "}",
                  ],
                  type: 'text/javascript',
                },
              },
            ],
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{userToken}}' }],
              url: parseUrl('GET', '{{baseUrl}}/api/cart'),
            },
          },
          ...checkoutCases.map((tc) => makeRequest(tc)),
        ],
      },
      {
        name: 'FR-19 Admin Users',
        description: 'GET /api/admin/users & DELETE /api/admin/users/:id — Pool C',
        item: adminCases.map((tc) => {
          const copy = { ...tc };
          if (copy.endpoint.includes('disposableUserId')) {
            copy.endpoint = copy.endpoint.replace('{{disposableUserId}}', '{{disposableUserId}}');
          }
          return makeRequest(copy);
        }),
      },
    ],
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(collection, null, 2) + '\n');
  console.log(`Wrote collection with ${loginCases.length + checkoutCases.length + adminCases.length + 4} requests -> ${OUT}`);
}

main();
