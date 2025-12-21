import assert from 'node:assert/strict'

const getBody = async (req) => {
	const chunks = []
	let size = 0
	for await (const chunk of req) {
		size += chunk.length
		if (size > 1e5) { //100KB
			throw new Error("request too large")
		}
		chunks.push(chunk)
	}
	return JSON.parse(Buffer.concat(chunks).toString())
}

const validateIncident = (incident) => {
	const { id, title, severity, status, createdAt } = incident
	const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/

	assert(typeof id === 'string')
	assert(uuidRegex.test(id))

	assert(typeof title === 'string')

	assert(typeof severity === 'string')
	assert(['low', 'medium', 'high'].includes(severity))

	assert(typeof status === 'string')
	assert(['open', 'acknowledged', 'resolved'].includes(status))

	assert(typeof createdAt === 'number')
	assert(createdAt > 0)
}

export { getBody, validateIncident }
