import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createTestServer } from '../src/utils.mjs'

let server
let baseUrl

before(() => {
	server = createTestServer()
	server.listen(0)
	baseUrl = `http://localhost:${server.address().port}/incidents`
})

after(() => {
	server.db.close()
	server.close()
})

test('insert incident', async () => {
	const incident = {
		title: 'test',
		severity: 'low',
	}

	const response = await fetch(
		baseUrl,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(incident)
		})

	const actual = await response.json()
	assert.strictEqual(response.status, 200)
	assert.strictEqual(actual.acknowledged, true)
	assert.match(actual.insertedId, /[a-f0-9]+/)
})

test('insert invalid incident', async () => {
	const incident = { invalid: "incident" }
	const response = await fetch(
		baseUrl,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(incident)
		})

	assert.strictEqual(response.status, 400)
	assert.deepStrictEqual((await response.json()).error,
		[
			'undefined fields: invalid',
			'"title" must be a non-empty string',
			'"severity" must be "low", "medium" or "high"'
		]
	)
})

