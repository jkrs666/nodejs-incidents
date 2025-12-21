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
	const errors = []

	const undefinedFields = Object.keys(incident).filter(k => !['id', 'title', 'severity', 'status', 'createdAt'].includes(k))
	if (undefinedFields.length > 0)
		errors.push(`undefined fields: ${undefinedFields}`)

	if (typeof id !== 'string' || !uuidRegex.test(id))
		errors.push('"id" must be a valid UUID v4 string')

	if (typeof title !== 'string')
		errors.push('"title" must be string')

	if (typeof severity !== 'string' || !['low', 'medium', 'high'].includes(severity))
		errors.push('"severity" must be "low", "medium" or "high"')

	if (typeof status !== 'string' || !['open', 'acknowledged', 'resolved'].includes(status))
		errors.push('"status" must be "open", "acknowledged" or "resolved"')

	if (typeof createdAt !== 'number' || createdAt < 0)
		errors.push('"createdAt" must be a Unix timestamp (integer, milliseconds)')

	return errors
}



export { getBody, validateIncident }
