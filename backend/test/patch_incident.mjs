import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import server from '../src/server.mjs'
import repo from '../src/repo.mjs'
import { createDbClient } from '../src/utils.mjs'

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



	const insertedId = JSON.parse(await response.text()).insertedId
	const dbClient = createDbClient()
	dbClient.connect()
	initialIncident = await repo.getIncidentById(dbClient, insertedId)
	dbClient.close()
	baseUrl = `http://localhost:${testServer.address().port}/incidents/${insertedId}`
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

	assert.strictEqual(response.status, 200)
	assert.deepStrictEqual(JSON.parse(await response.text()), {
		"acknowledged": true,
		"modifiedCount": 1,
		"upsertedId": null,
		"upsertedCount": 0,
		"matchedCount": 1
	}
	)
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
	assert.deepStrictEqual(JSON.parse(await response.text()).error,
		[
			'undefined fields: invalid',
			'"title" must be string',
			'"severity" must be "low", "medium" or "high"',
			'"status" must be "open", "acknowledged" or "resolved"',
		]
	)
})

