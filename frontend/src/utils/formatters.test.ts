import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  formatCurrency, 
  formatDate, 
  getRiskLevelDetails, 
  getStatusDetails 
} from './formatters.ts';

describe('Formatters Unit Tests', () => {
  test('formatCurrency formats valid numeric inputs into USD representation', () => {
    assert.equal(formatCurrency(1250), '$1,250.00');
    assert.equal(formatCurrency(0), '$0.00');
    assert.equal(formatCurrency(84500.5), '$84,500.50');
  });

  test('formatCurrency handles null, undefined, and non-numeric inputs gracefully', () => {
    assert.equal(formatCurrency(null as any), '$0.00');
    assert.equal(formatCurrency(undefined as any), '$0.00');
    assert.equal(formatCurrency(NaN), '$0.00');
  });

    test('formatDate formats valid ISO dates and handles empty inputs', () => {
    const formatted = formatDate('2026-09-28T12:00:00Z');
    assert.ok(formatted.includes('2026') || formatted.includes('Sep'));
    assert.equal(formatDate(''), 'N/A');
    assert.equal(formatDate('invalid-date-string'), 'invalid-date-string');
  });

  test('getRiskLevelDetails returns correct label and badge for risk tiers', () => {
    const low = getRiskLevelDetails('low');
    assert.equal(low.label, 'LOW RISK');
    assert.ok(low.badgeClass.includes('emerald'));

    const med = getRiskLevelDetails('medium');
    assert.equal(med.label, 'MEDIUM RISK');
    assert.ok(med.badgeClass.includes('amber'));

    const high = getRiskLevelDetails('high');
    assert.equal(high.label, 'HIGH RISK');
    assert.ok(high.badgeClass.includes('rose'));

    const unknown = getRiskLevelDetails('other');
    assert.equal(unknown.label, 'UNKNOWN');
  });

  test('getStatusDetails maps pending_review, approved, and rejected states', () => {
    const pending = getStatusDetails('pending_review');
    assert.equal(pending.label, 'Pending Review');

    const approved = getStatusDetails('approved');
    assert.equal(approved.label, 'Approved');

    const rejected = getStatusDetails('rejected');
    assert.equal(rejected.label, 'Rejected');

    const fallback = getStatusDetails('custom_status');
    assert.equal(fallback.label, 'custom_status');
  });
});
