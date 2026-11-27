import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parameterOptionLabel } from '../src/utils/parameterLabel.ts';

test('dropdown labels keep the provider casing', () => {
  // Issue #236: ammonia was shown as Ammonia, carbon_monoxide as Carbon_monoxide.
  assert.equal(parameterOptionLabel('ammonia'), 'ammonia');
  assert.equal(parameterOptionLabel('carbon_monoxide'), 'carbon_monoxide');
  assert.equal(parameterOptionLabel('01'), '01');
});
