import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import repo from '../src/repo.mjs'
import { createDbClient, createTestServer } from '../src/utils.mjs'

let server
let baseUrl
let initialIncident

before(async () => {
	server = createTestServer()
	server.listen(0)

	const insertReqBody = {
		title: 'test',
		severity: 'low',
	}

	const response = await fetch(
		`http://localhost:${server.address().port}/incidents`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(insertReqBody)
		})



	const insertedId = (await response.json()).insertedId
	const dbClient = createDbClient()
	dbClient.connect()
	initialIncident = await repo.getIncidentById(dbClient, insertedId)
	dbClient.close()
	baseUrl = `http://localhost:${server.address().port}/incidents/${insertedId}`
})

after(() => {
	server.db.close()
	server.close()
})

test('update incident', async () => {
	const reqBody = { severity: 'high' }
	const response = await fetch(
		baseUrl,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(reqBody)
		})

	assert.strictEqual(response.status, 200)
	assert.strictEqual((await response.json()).severity, "high")
})

test('patch invalid incident', async () => {
	const incident = { invalid: "incident", title: 123, status: 123, severity: 123 }
	const response = await fetch(
		baseUrl,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(incident)
		})

	assert.strictEqual(response.status, 400)
	assert.deepStrictEqual((await response.json()).error,
		[
			'undefined fields: invalid',
			'"title" must be a non-empty string',
			'"severity" must be "low", "medium" or "high"',
			'"status" must be "open", "acknowledged" or "resolved"',
		]
	)
})

test('not found incident', async () => {
	const incident = { title: "not found" }
	const response = await fetch(
		`http://localhost:${server.address().port}/incidents/777777777777777777777777`,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(incident)
		})

	assert.strictEqual(response.status, 404)
	assert.deepStrictEqual((await response.json()).error,
		'incident 777777777777777777777777 not found'
	)
})

