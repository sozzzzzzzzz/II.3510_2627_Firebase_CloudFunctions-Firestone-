const assert = require('node:assert/strict');
const { test } = require('node:test');
const { moderate } = require('./moderation.cjs');

test('publishes an ordinary listing', () => assert.equal(moderate('Calculatrice TI'), 'approved'));
test('rejects banned words with punctuation', () => assert.equal(moderate('Offre SPAM !'), 'rejected'));
test('normalizes accents', () => assert.equal(moderate('Àrnaque'), 'rejected'));
test('accepts words containing a banned substring', () => assert.equal(moderate('Antispam'), 'approved'));