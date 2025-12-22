import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import server from '../src/server.mjs'

let testServer
let baseUrl

before(() => {
	testServer = server.listen(0)
	baseUrl = `http://localhost:${testServer.address().port}/incidents`
})

after(() => testServer.close())

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

	const actual = JSON.parse(await response.text())
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
	assert.deepStrictEqual(JSON.parse(await response.text()).error,
		[
			'undefined fields: invalid',
			'"title" must be string',
			'"severity" must be "low", "medium" or "high"'
		]
	)
})

