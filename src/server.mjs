import { createServer } from 'node:http'
import { validateIncident, getBody } from './utils.mjs'

const incidents = []

const server = createServer(async (req, res) => {
	res.statusCode = 200
	res.setHeader('Content-Type', 'application/json')

	const router = async (endpoint) => {
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
