import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import server from '../src/server.mjs'

let testServer
let baseUrl
let initialIncident

beforeEach(async () => {
	// start server and insert initial incident
	testServer = server.listen(0)
	const insertReqBody = {
		title: 'test',
		severity: 'low',
	}

	const response = await fetch(
		`http://localhost:${testServer.address().port}/incidents`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(insertReqBody)
		})


	initialIncident = JSON.parse(await response.text())
	baseUrl = `http://localhost:${testServer.address().port}/incidents/${initialIncident.id}`
})

afterEach(() => testServer.close())

test('update incident', async () => {
	const reqBody = { severity: 'high' }
	const response = await fetch(
		baseUrl,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(reqBody)
		})

	const expected = { ...initialIncident, ...reqBody }

	assert.strictEqual(response.status, 200)
	assert.deepStrictEqual(JSON.parse(await response.text()), expected)
})

test('patch invalid incident', async () => {
	const incident = { invalid: "incident", title: 123, status: 123, createdAt: -1, severity: 123 }
	const response = await fetch(
		baseUrl,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(incident)
		})

	assert.strictEqual(response.status, 400)
	assert.deepStrictEqual(JSON.parse(await response.text()).error,
		[
			'undefined fields: invalid',
			'"title" must be string',
			'"severity" must be "low", "medium" or "high"',
			'"status" must be "open", "acknowledged" or "resolved"',
			'"createdAt" must be a Unix timestamp (integer, milliseconds)'
		]
	)
})

