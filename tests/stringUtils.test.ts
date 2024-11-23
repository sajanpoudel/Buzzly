import test from 'node:test'
import assert from 'node:assert/strict'

import { getInitialsFromEmail } from '../src/utils/stringUtils.ts'

test('uses the first letter of two name parts', () => {
  assert.equal(getInitialsFromEmail('jane.doe@example.com'), 'JD')
})

test('splits on underscores and hyphens too', () => {
  assert.equal(getInitialsFromEmail('jane_doe@example.com'), 'JD')
  assert.equal(getInitialsFromEmail('jane-doe@example.com'), 'JD')
})
