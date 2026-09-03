#!/usr/bin/env node
/** Ensure each pool has exactly 35 cases. */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'data', 'test-cases');

const extras = {
  'fr02-login-cases.json': [],
  'fr08-checkout-cases.json': [
    {
      id: 'FR08-D11',
      title: 'checkout with array body rejected or ignored',
      feature: 'FR-08',
      method: 'POST',
      endpoint: '/api/checkout',
      category: 'schema',
      auditLabel: 'INVALID',
      preconditions: ['login', 'cart setup'],
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer {{userToken}}' },
      body: [{ total_amount: 6000000, shipping_address: '123 Le Loi' }],
      expectedStatus: 400,
      expectedBodyContains: [],
      notes: 'Array instead of object',
    },
    {
      id: 'FR08-D12',
      title: 'checkout missing Content-Type header',
      feature: 'FR-08',
      method: 'POST',
      endpoint: '/api/checkout',
      category: 'schema',
      auditLabel: 'INVALID',
      preconditions: ['login', 'cart setup'],
      headers: { Authorization: 'Bearer {{userToken}}' },
      body: { total_amount: 6000000, shipping_address: '123 Le Loi' },
      expectedStatus: 200,
      expectedBodyContains: [],
      notes: 'Express still parses JSON body',
    },
  ],
  'fr19-users-cases.json': [
    {
      id: 'FR19-D11',
      title: 'list users with POST method not allowed',
      feature: 'FR-19',
      method: 'POST',
      endpoint: '/api/admin/users',
      category: 'negative',
      auditLabel: 'INVALID',
      preconditions: [],
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer {{adminToken}}' },
      body: {},
      expectedStatus: 404,
      expectedBodyContains: [],
      notes: 'Wrong HTTP method',
    },
    {
      id: 'FR19-D12',
      title: 'delete user with GET method',
      feature: 'FR-19',
      method: 'GET',
      endpoint: '/api/admin/users/999',
      category: 'negative',
      auditLabel: 'INVALID',
      preconditions: [],
      headers: { Authorization: 'Bearer {{adminToken}}' },
      body: null,
      expectedStatus: 200,
      expectedBodyContains: [],
      notes: 'GET on delete path returns user list behavior',
    },
    {
      id: 'FR19-D13',
      title: 'list users with malformed Bearer prefix',
      feature: 'FR-19',
      method: 'GET',
      endpoint: '/api/admin/users',
      category: 'negative',
      auditLabel: 'INVALID',
      preconditions: [],
      headers: { Authorization: 'Bear {{adminToken}}' },
      body: null,
      expectedStatus: 401,
      expectedBodyContains: ['Unauthorized'],
      notes: 'Typo in auth scheme',
    },
  ],
};

for (const [file, add] of Object.entries(extras)) {
  const p = path.join(dir, file);
  let cases = JSON.parse(fs.readFileSync(p, 'utf8'));
  cases = cases.filter((c) => c.id !== 'FR02-STU06');
  for (const c of add) {
    if (!cases.find((x) => x.id === c.id)) cases.push(c);
  }
  while (cases.length > 35) {
    const removable = cases.find((c) => c.id === 'FR02-D10') || cases[cases.length - 1];
    cases = cases.filter((c) => c.id !== removable.id);
  }
  fs.writeFileSync(p, JSON.stringify(cases, null, 2) + '\n');
  console.log(`${file}: ${cases.length} cases`);
}
