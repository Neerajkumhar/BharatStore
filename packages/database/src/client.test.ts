import { describe, it, expect } from 'vitest';
import { getTenantDb } from './client';

describe('Tenant Database Isolation', () => {
  it('throws error when tenantId is empty', () => {
    expect(() => getTenantDb('')).toThrow('[Security Exception]');
  });
});
