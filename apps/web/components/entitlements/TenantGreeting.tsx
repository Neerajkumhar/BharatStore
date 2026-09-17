'use client';

import React from 'react';
import { useEntitlements } from './EntitlementProvider';

export function TenantGreeting() {
  const { session } = useEntitlements();
  return (
    <>
      Namaste, {session.tenantName ?? 'there'} <span aria-hidden="true">🙏</span>
    </>
  );
}

export function TenantLocation() {
  const { session } = useEntitlements();
  return <>{session.location ?? 'Your store'} storefront · Live &amp; synced</>;
}
