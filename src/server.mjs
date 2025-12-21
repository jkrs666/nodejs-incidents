import { createServer } from 'node:http'
import { validateIncident, getBody } from './utils.mjs'

const incidents = [
	{
		id: 'a1101818-cb9e-4631-92c1-69a045778aa3',
		title: 'test',
		severity: 'low',
		status: 'open',
		createdAt: 1777777777777
	}
]

const createIncident = async (req, res) => {
	const incident = {
		...await getBody(req),
		id: crypto.randomUUID(),
		createdAt: new Date().getTime(),
		status: 'open'
	}

	const errors = validateIncident(incident)
	if (errors.length > 0) {
		res.statusCode = 400
		return { error: errors }
	}

	incidents.push(incident)
	return incident
}

const updateIncident = async (req, res, id) => {
	const patchBody = await getBody(req)

	const i = incidents.findIndex(i => i.id === id)
	if (i == -1) {
		res.statusCode = 404
		return { error: `incident ${id} not found` }
	}

	const incident = { ...incidents[i], ...patchBody }


	const errors = validateIncident(incident)
	if (errors.length > 0) {
		res.statusCode = 400
		return { error: errors }
	}

	incidents[i] = incident
	return incidents[i]
}

const server = createServer(async (req, res) => {
	res.statusCode = 200
	res.setHeader('Content-Type', 'application/json')

	const router = async (endpoint) => {
		let m = endpoint.match('PATCH /incidents/([a-z0-9-]+)')
		if (m !== null) {
			let [_, id] = m
			return await updateIncident(req, res, id)
		}

		switch (endpoint) {
			case 'GET /incidents': return incidents
			case 'POST /incidents': return createIncident(req, res)
			default: {
				res.statusCode = 404
				return { error: `endpoint ${endpoint} not found` }
			}
		}
	}

	try {
		let endpoint = `${req.method} ${req.url}`
		let response = await router(endpoint)
		res.end(JSON.stringify(response))
	} catch (err) {
		console.log(err)
		res.statusCode = 500
		res.end(JSON.stringify({ error: err.message }))
	}
})

export default server
