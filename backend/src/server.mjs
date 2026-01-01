import { createServer as createNodeServer } from 'node:http'
import { validatePostIncidentRequest, validatePatchIncidentRequest, getBody } from './utils.mjs'
import repo from './repo.mjs'

const createServer = (wss, db) => {
	const server = createNodeServer()
	server.wss = wss
	server.db = db

	const createIncident = async (req, res) => {
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

		const response = await repo.insertIncident(server.db, incident)
		const insertedIncident = await repo.getIncidentById(server.db, response.insertedId)
		server.wss.broadcastIncident(insertedIncident)
		return response
	}

	const updateIncident = async (req, res, id) => {
		const patchBody = await getBody(req)

		const errors = validatePatchIncidentRequest(patchBody)
		if (errors.length > 0) {
			res.statusCode = 400
			return { error: errors }
		}

		const updatedIncident = await repo.updateIncident(server.db, id, patchBody)

		if (updatedIncident === null) {
			res.statusCode = 404
			return { error: `incident ${id} not found` }
		}

		server.wss.broadcastIncident(updatedIncident)
		return updatedIncident
	}

	const router = async (endpoint, req, res) => {
		if ((/OPTIONS \/incidents/).test(endpoint)) return
		if (endpoint === 'GET /incidents') return repo.getAllIncidents(server.db)
		if (endpoint === 'POST /incidents') return createIncident(req, res)
		let m = endpoint.match('PATCH /incidents/([a-f0-9-]+)$')
		if (m !== null) {
			let [_, id] = m
			return await updateIncident(req, res, id)
		}

		res.statusCode = 404
		return { error: `endpoint ${endpoint} not found` }
	}

	server.on('request', async (req, res) => {
		res.statusCode = 200
		res.setHeaders(new Map([
			['Content-Type', 'application/json'],
			['Access-Control-Allow-Origin', 'http://localhost:3001'],
			["Access-Control-Allow-Methods", "GET, PATCH, POST, OPTIONS"],
			["Access-Control-Allow-Headers", "Content-Type"],
		]))

		try {
			const endpoint = `${req.method} ${req.url}`
			const response = await router(endpoint, req, res)
			res.end(JSON.stringify(response))
		} catch (err) {
			console.log(err)
			res.statusCode = 500
			res.end(JSON.stringify({ error: err.message }))
		}
	})

	return server
}

export { createServer }
