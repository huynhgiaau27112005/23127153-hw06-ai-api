#!/usr/bin/env node
/** Prepare fr*-cases.json from source files with audit labels. */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'data', 'test-cases');

const MAP = [
  ['fr02-login.json', 'fr02-login-cases.json'],
  ['fr08-checkout.json', 'fr08-checkout-cases.json'],
  ['fr19-admin-users.json', 'fr19-users-cases.json'],
];

function deriveAuditLabel(c) {
  if (/STU\d+/.test(c.id)) return 'EXT';
  const pre = (c.preconditions || []).join(' ');
  if (
    pre.length > 0 &&
    /lock|delete once|checkout once|checkout again|mass registration|admin deletes self|add then clear|user B cart|fail login 2|delete user then|register 3|reuse old token|parallel/i.test(pre)
  ) return 'INCOMPLETE';
  if (c.category === 'security' && c.expectedStatus === 200) return 'INCOMPLETE';
  if (c.category === 'state' && pre.length > 0) return 'INCOMPLETE';
  if (c.expectedStatus >= 400 || c.category === 'negative') return 'INVALID';
  return 'VALID';
}

const EXTRA = {
  'fr08-checkout-cases.json': [
    { id: 'FR08-D11', title: 'checkout with array body', feature: 'FR-08', method: 'POST', endpoint: '/api/checkout', category: 'schema', auditLabel: 'INVALID', preconditions: ['login', 'cart setup'], headers: { 'Content-Type': 'application/json', Authorization: 'Bearer {{userToken}}' }, body: [{ total_amount: 6000000, shipping_address: '123 Le Loi' }], expectedStatus: 400, expectedBodyContains: [], notes: 'Array instead of object' },
    { id: 'FR08-D12', title: 'checkout missing Content-Type', feature: 'FR-08', method: 'POST', endpoint: '/api/checkout', category: 'schema', auditLabel: 'VALID', preconditions: ['login', 'cart setup'], headers: { Authorization: 'Bearer {{userToken}}' }, body: { total_amount: 6000000, shipping_address: '123 Le Loi' }, expectedStatus: 200, expectedBodyContains: [], notes: '' },
  ],
  'fr19-users-cases.json': [
    { id: 'FR19-D11', title: 'POST method on list endpoint', feature: 'FR-19', method: 'POST', endpoint: '/api/admin/users', category: 'negative', auditLabel: 'INVALID', preconditions: [], headers: { 'Content-Type': 'application/json', Authorization: 'Bearer {{adminToken}}' }, body: {}, expectedStatus: 404, expectedBodyContains: [], notes: '' },
    { id: 'FR19-D12', title: 'GET on delete path with numeric id', feature: 'FR-19', method: 'GET', endpoint: '/api/admin/users/999', category: 'negative', auditLabel: 'INVALID', preconditions: [], headers: { Authorization: 'Bearer {{adminToken}}' }, body: null, expectedStatus: 200, expectedBodyContains: [], notes: '' },
    { id: 'FR19-D13', title: 'malformed Bearer prefix', feature: 'FR-19', method: 'GET', endpoint: '/api/admin/users', category: 'negative', auditLabel: 'INVALID', preconditions: [], headers: { Authorization: 'Bear {{adminToken}}' }, body: null, expectedStatus: 401, expectedBodyContains: ['Unauthorized'], notes: '' },
  ],
};

for (const [src, dest] of MAP) {
  const srcPath = path.join(dir, src);
  const destPath = path.join(dir, dest);
  let cases;
  if (fs.existsSync(srcPath)) {
    cases = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
  } else if (fs.existsSync(destPath)) {
    cases = JSON.parse(fs.readFileSync(destPath, 'utf8'));
  } else {
    console.error('Missing:', src);
    continue;
  }
  cases = cases.filter((c) => c.id !== 'FR02-STU06' && c.id !== 'FR08-STU06' && c.id !== 'FR19-STU06');
  cases = cases.map((c) => ({ ...c, auditLabel: deriveAuditLabel(c) }));
  for (const ex of EXTRA[dest] || []) {
    if (!cases.find((x) => x.id === ex.id)) cases.push(ex);
  }
  while (cases.length > 35) {
    const drop = cases.find((c) => c.id === 'FR02-D10') || cases[cases.length - 1];
    cases = cases.filter((c) => c.id !== drop.id);
  }
  fs.writeFileSync(destPath, JSON.stringify(cases, null, 2) + '\n');
  console.log(`${dest}: ${cases.length} cases`);
}
