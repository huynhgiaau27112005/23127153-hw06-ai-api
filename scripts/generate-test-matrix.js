#!/usr/bin/env node
/**
 * Export data/test-cases/*.json to Excel-compatible CSV (UTF-8 BOM).
 * Usage: node scripts/generate-test-matrix.js [outputPath]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CASES_DIR = path.join(ROOT, 'data', 'test-cases');
const STUDENT_ID = '23127153';
const DEFAULT_OUT = path.join(ROOT, 'data', 'test-matrix.csv');

const HEADERS = [
  'StudentId',
  'CaseId',
  'Feature',
  'Title',
  'Method',
  'Endpoint',
  'Category',
  'AuditLabel',
  'ExpectedStatus',
  'Preconditions',
  'Notes',
  'BodySummary',
];

function escapeCsv(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function bodySummary(body) {
  if (!body || typeof body !== 'object') return '';
  try {
    const flat = JSON.stringify(body);
    return flat.length > 120 ? `${flat.slice(0, 117)}...` : flat;
  } catch {
    return '';
  }
}

function main() {
  const outPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_OUT;
  const files = fs
    .readdirSync(CASES_DIR)
    .filter((f) => f.endsWith('-cases.json'))
    .sort();

  const rows = [HEADERS.join(',')];

  for (const file of files) {
    const cases = JSON.parse(fs.readFileSync(path.join(CASES_DIR, file), 'utf8'));
    for (const c of cases) {
      const row = [
        STUDENT_ID,
        c.id,
        c.feature,
        c.title,
        c.method,
        c.endpoint,
        c.category,
        c.auditLabel,
        c.expectedStatus,
        (c.preconditions || []).join('; '),
        c.notes || '',
        bodySummary(c.body),
      ].map(escapeCsv);
      rows.push(row.join(','));
    }
  }

  const bom = '\uFEFF';
  fs.writeFileSync(outPath, bom + rows.join('\n') + '\n', 'utf8');
  console.log(`Exported ${rows.length - 1} rows to ${outPath}`);
}

main();
