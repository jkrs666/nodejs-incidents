import { test } from 'node:test'
import assert from 'node:assert/strict'
import server from '../src/server.mjs'

const testRequest = async (path, options) => {
	const testServer = server.listen(0)
	const port = testServer.address().port
	const response = await fetch(
		`http://localhost:${port}/${path}`, options)
	testServer.close()
	return response
}

test('insert incident', async () => {
	const incident = {
		id: crypto.randomUUID(),
		title: 'test',
		severity: 'low',
		status: 'open',
		createdAt: 1777777777777
	}
	const response = await testRequest(
		'incidents', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(incident)
	})

	assert.strictEqual(response.status, 200)
})

test('insert invalid incident', async () => {
	const incident = { invalid: "incident" }
	const response = await testRequest(
		'incidents', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(incident)
	})

	assert.strictEqual(response.status, 400)
	assert.strictEqual(JSON.parse(await response.text()).error,
		"invalid request. The expression evaluated to a falsy value:\n\n  assert(typeof id === 'string')\n")
})
