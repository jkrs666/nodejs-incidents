import { createServer } from 'node:http'
import { validateIncident, getBody } from './utils.mjs'

const incidents = [
	{
		id: 'qwer',
		title: 'test',
		severity: 'low',
		status: 'open',
		createdAt: 1777777777777
	}
]

const server = createServer(async (req, res) => {
	res.statusCode = 200
	res.setHeader('Content-Type', 'application/json')

	const router = async (endpoint) => {
		let m = endpoint.match('PATCH /incidents/([a-z0-9-]+)')
		if (m !== null) {
			let [_, id] = m
			console.log(m)
			console.log(id)
			const patchBody = await getBody(req)
			const i = incidents.findIndex(i => i.id === id)
			incidents[i] = { ...incidents[i], ...patchBody }
			console.log(incidents)
			return m
		}

		switch (endpoint) {
			case 'GET /incidents': return incidents
			case 'POST /incidents': {
				const incident = await getBody(req)
				try {
					validateIncident(incident)
				} catch (err) {
					res.statusCode = 400
					return { error: `invalid request. ${err.message}` }
				}
				incidents.push(incident)
				return { message: 'incident inserted' }
			}
			default: {
				res.statusCode = 404
				return { error: 'not found' }
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
