import assert from 'node:assert/strict';
import { test } from 'node:test';

import { selectParameterValue } from '../src/utils/parameterValue.ts';

test('a list queryable stays a list when a new option is chosen', () => {
  // ecmwf:month default ["01"] is emitted as a list; choosing 02 must not
  // become the string "02" (issue #237).
  const next = selectParameterValue('string', ['01'], {
    value: '02',
    label: '02'
  });
  assert.deepEqual(next, ['02']);
});

test('an array schema stays a list even if the control emits one option', () => {
  const next = selectParameterValue('array', undefined, {
    value: '02',
    label: '02'
  });
  assert.deepEqual(next, ['02']);
});

test('a string queryable stays a string', () => {
  const next = selectParameterValue('string', '0', {
    value: '1',
    label: '1'
  });
  assert.equal(next, '1');
});

test('a multi-select stays a list of values', () => {
  const next = selectParameterValue('array', ['01'], [
    { value: '01', label: '01' },
    { value: '02', label: '02' }
  ]);
  assert.deepEqual(next, ['01', '02']);
});

test('clearing the control drops the value', () => {
  assert.equal(selectParameterValue('array', ['01'], null), undefined);
});
