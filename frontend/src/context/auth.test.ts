import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_USERS } from './authTypes.ts';

describe('Authentication & Persona Unit Tests', () => {
  test('DEMO_USERS array contains at least 3 distinct role-governed personas', () => {
    assert.ok(DEMO_USERS.length >= 3, 'Expected at least 3 demo personas');
  });

  test('Primary demo reviewer is configured with demo@invoiceguard.local', () => {
    const defaultReviewer = DEMO_USERS.find((u) => u.id === 'demo_reviewer');
    assert.ok(defaultReviewer, 'Demo reviewer persona missing');
    assert.equal(defaultReviewer.email, 'demo@invoiceguard.local');
    assert.equal(defaultReviewer.isDemoMode, true);
  });

  test('All demo personas have non-empty name, email, department, role, and initials', () => {
    for (const persona of DEMO_USERS) {
      assert.ok(persona.id.trim().length > 0, 'Persona id should not be empty');
      assert.ok(persona.name.trim().length > 0, 'Persona name should not be empty');
      assert.ok(persona.email.includes('@'), `Invalid email format: ${persona.email}`);
      assert.ok(persona.role.trim().length > 0, 'Persona role should not be empty');
      assert.ok(persona.department.trim().length > 0, 'Persona department should not be empty');
      assert.ok(persona.avatarInitials.trim().length > 0, 'Avatar initials should not be empty');
    }
  });

  test('All demo persona emails are unique', () => {
    const emails = DEMO_USERS.map((u) => u.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    assert.equal(emails.length, uniqueEmails.size, 'Duplicate email detected across demo users');
  });
});
