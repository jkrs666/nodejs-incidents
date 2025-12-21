import { validateIncident } from '../src/utils.mjs'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('valid Incident', () => {
	assert.doesNotThrow(() =>
		validateIncident({
			id: crypto.randomUUID(),
			title: 'test',
			severity: 'low',
			status: 'open',
			createdAt: 1777777777777
		}))
})

test('invalid Incident, invalid id', () => {
	assert.throws(() =>
		validateIncident({
			id: "INVALID",
			title: 'test',
			severity: 'low',
			status: 'open',
			createdAt: 1777777777777
		}),
		assert.AssertionError)
})

test('invalid Incident, invalid severity', () => {
	assert.throws(() =>
		validateIncident({
			id: crypto.randomUUID(),
			title: 'test',
			severity: 'INVALID',
			status: 'open',
			createdAt: 1777777777777
		}),
		assert.AssertionError)
})

test('invalid Incident, invalid status', () => {
	assert.throws(() =>
		validateIncident({
			id: crypto.randomUUID(),
			title: 'test',
			severity: 'high',
			status: 'INVALID',
			createdAt: 1777777777777
		}),
		assert.AssertionError)
})


test('invalid Incident, invalid createdAt', () => {
	assert.throws(() =>
		validateIncident({
			id: crypto.randomUUID(),
			title: 'test',
			severity: 'high',
			status: 'resolved',
			createdAt: -1
		}),
		assert.AssertionError)
})
