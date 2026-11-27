import assert from 'node:assert/strict';
import test from 'node:test';
import { finiteCoordinate } from '../src/utils/mapCenter.ts';

test('an unfinished coordinate keeps the previous map center', () => {
  assert.equal(finiteCoordinate(Number.NaN, 46.8), 46.8);
  assert.equal(finiteCoordinate(undefined, 1.8), 1.8);
  assert.equal(finiteCoordinate(null, 4), 4);
  assert.equal(finiteCoordinate('-', 1.8), 1.8);
  assert.equal(finiteCoordinate('', 4), 4);
});

test('a finished coordinate is kept, including zero and negatives', () => {
  assert.equal(finiteCoordinate(0, 46.8), 0);
  assert.equal(finiteCoordinate(-12.5, 0), -12.5);
  assert.equal(finiteCoordinate(4, 1), 4);
});
