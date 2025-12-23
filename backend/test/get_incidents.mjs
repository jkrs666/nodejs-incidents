import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createTestServer } from '../src/utils.mjs'

let server

beforeEach(() => {
	server = createTestServer()
	server.listen(0)
})
afterEach(() => server.close())

test('get incidents', async () => {
	const baseUrl = `http://localhost:${server.address().port}/incidents`
	const insertReqBody = {
		title: 'test',
		severity: 'low',
	}

	await fetch(
		baseUrl,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(insertReqBody)
		})

	const allIncidentsResponse = await fetch(baseUrl)
	const allIncidents = JSON.parse(await allIncidentsResponse.text())

	assert.strictEqual(allIncidentsResponse.status, 200)
	allIncidents.forEach(i => {
		assert.match(i.id, /[a-f0-9]+/)
		assert.match(i.title, /\w+/)
		assert.match(i.severity, /(low|medium|high)/)
		assert.match(i.status, /(open|acknowledged|resolved)/)
		assert.match(i.createdAt, /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/)
	})
})
