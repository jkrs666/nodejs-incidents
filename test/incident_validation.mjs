import { validateIncident } from '../src/utils.mjs'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('valid Incident', () => {
	const errors = validateIncident({
		id: crypto.randomUUID(),
		title: 'test',
		severity: 'low',
		status: 'open',
		createdAt: 1777777777777
	})
	assert.deepStrictEqual(errors, [])
})

test('invalid Incident, undefined field', () => {
	const errors = validateIncident({
		id: crypto.randomUUID(),
		title: 'test',
		severity: 'high',
		status: 'resolved',
		createdAt: 1777777777777,
		randomField: "undefined"
	})
	assert.deepStrictEqual(errors, [
		'undefined fields: randomField'
	])
})

test('invalid Incident, invalid id', () => {
	const errors = validateIncident({
		id: "INVALID",
		title: 'test',
		severity: 'low',
		status: 'open',
		createdAt: 1777777777777
	})
	assert.deepStrictEqual(errors, [
		'"id" must be a valid UUID v4 string'
	])
})

test('invalid Incident, invalid severity', () => {
	const errors = validateIncident({
		id: crypto.randomUUID(),
		title: 'test',
		severity: 'INVALID',
		status: 'open',
		createdAt: 1777777777777
	})
	assert.deepStrictEqual(errors, [
		'"severity" must be "low", "medium" or "high"',
	])
})

test('invalid Incident, invalid status', () => {
	const errors = validateIncident({
		id: crypto.randomUUID(),
		title: 'test',
		severity: 'high',
		status: 'INVALID',
		createdAt: 1777777777777
	})
	assert.deepStrictEqual(errors, [
		'"status" must be "open", "acknowledged" or "resolved"',
	])
})


test('invalid Incident, invalid createdAt', () => {
	const errors = validateIncident({
		id: crypto.randomUUID(),
		title: 'test',
		severity: 'high',
		status: 'resolved',
		createdAt: -1
	})
	assert.deepStrictEqual(errors, [
		'"createdAt" must be a Unix timestamp (integer, milliseconds)'
	])
})
