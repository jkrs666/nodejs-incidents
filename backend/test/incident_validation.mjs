import { validatePostIncidentRequest, validatePatchIncidentRequest } from '../src/utils.mjs'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('valid post incident request', () => {
	const errors = validatePostIncidentRequest({
		title: 'test',
		severity: 'low',
	})
	assert.deepStrictEqual(errors, [])
})

test('invalid post incident request, undefined field', () => {
	const errors = validatePostIncidentRequest({
		title: 'test',
		severity: 'high',
		randomField: "undefined"
	})
	assert.deepStrictEqual(errors, [
		'undefined fields: randomField'
	])
})

test('invalid post incident request, empty title', () => {
	const errors = validatePostIncidentRequest({
		title: '',
		severity: 'low'
	})
	assert.deepStrictEqual(errors, [
		'"title" must be a non-empty string',
	])
})

test('invalid post incident request, invalid severity', () => {
	const errors = validatePostIncidentRequest({
		title: 'test',
		severity: 'INVALID',
	})
	assert.deepStrictEqual(errors, [
		'"severity" must be "low", "medium" or "high"',
	])
})

test('invalid post incident request, can not set  id,status,createdAt', () => {
	const errors = validatePostIncidentRequest({
		id: 'not allowed',
		title: 'test',
		severity: 'high',
		status: 'resolved',
		createdAt: new Date(),
	})
	assert.deepStrictEqual(errors, [
		'can not set fields: id,status,createdAt'
	])
})

test('valid patch incident request', () => {
	const errors = validatePatchIncidentRequest({
		title: 'test',
		severity: 'low',
		status: 'resolved',
	})
	assert.deepStrictEqual(errors, [])
})

test('invalid patch incident request, undefined field', () => {
	const errors = validatePatchIncidentRequest({
		randomField: "undefined"
	})
	assert.deepStrictEqual(errors, [
		'undefined fields: randomField'
	])
})

test('invalid patch incident request, invalid title', () => {
	const errors = validatePatchIncidentRequest({
		title: '',
	})
	assert.deepStrictEqual(errors, [
		'"title" must be a non-empty string',
	])
})

test('invalid patch incident request, invalid severity', () => {
	const errors = validatePatchIncidentRequest({
		severity: 'INVALID',
	})
	assert.deepStrictEqual(errors, [
		'"severity" must be "low", "medium" or "high"',
	])
})

test('invalid patch incident request, invalid status', () => {
	const errors = validatePatchIncidentRequest({
		status: 'INVALID',
	})
	assert.deepStrictEqual(errors, [
		'"status" must be "open", "acknowledged" or "resolved"',
	])
})

test('invalid patch incident request, can not set  id,createdAt', () => {
	const errors = validatePatchIncidentRequest({
		id: 'not allowed',
		title: 'test',
		severity: 'high',
		status: 'resolved',
		createdAt: new Date(),
	})
	assert.deepStrictEqual(errors, [
		'can not set fields: id,createdAt'
	])
})
