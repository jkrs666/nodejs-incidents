import { createServer } from 'node:http'
import { validatePostIncidentRequest, validatePatchIncidentRequest, getBody, createDbClient } from './utils.mjs'
import repo from './repo.mjs'

const createIncident = async (db, req, res) => {
	const reqBody = await getBody(req)
	const errors = validatePostIncidentRequest(reqBody)
	if (errors.length > 0) {
		res.statusCode = 400
		return { error: errors }
	}

	const incident = {
		...reqBody,
		status: 'open'
	}
	return await repo.insertIncident(db, incident)
}

const updateIncident = async (db, req, res, id) => {
	const patchBody = await getBody(req)

	const errors = validatePatchIncidentRequest(patchBody)
	if (errors.length > 0) {
		res.statusCode = 400
		return { error: errors }
	}

	return repo.updateIncident(db, id, patchBody)
}

const server = createServer(async (req, res) => {
	res.statusCode = 200
	res.setHeader('Content-Type', 'application/json')
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001')
	res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	const dbClient = createDbClient()




	const router = async (endpoint) => {
		if ((/OPTIONS \/incidents/).test(endpoint)) return
		if (endpoint === 'GET /incidents') return repo.getAllIncidents(dbClient)
		if (endpoint === 'POST /incidents') return createIncident(dbClient, req, res)
		let m = endpoint.match('PATCH /incidents/([a-f0-9-]+)$')
		if (m !== null) {
			let [_, id] = m
			return await updateIncident(dbClient, req, res, id)
		}

		res.statusCode = 404
		return { error: `endpoint ${endpoint} not found` }
	}

	try {
		const endpoint = `${req.method} ${req.url}`
		const response = await router(endpoint)
		res.end(JSON.stringify(response))
	} catch (err) {
		console.log(err)
		res.statusCode = 500
		res.end(JSON.stringify({ error: err.message }))
	} finally {
		dbClient.close()
	}
})

export default server
