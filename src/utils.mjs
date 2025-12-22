import { MongoClient } from 'mongodb'

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

const isNullOrEmpty = (x) => x === undefined || x === null || x.length === 0

const validatePostIncidentRequest = (req) => {
	if (Object.keys(req).length === 0)
		return ["empty request body"]

	const { title, severity } = req
	const errors = []

	const immutableFields = Object.keys(req).filter(k => ['id', 'createdAt', 'status'].includes(k))
	if (immutableFields.length > 0)
		errors.push(`can not set fields: ${immutableFields}`)

	const undefinedFields = Object.keys(req).filter(k => !['id', 'createdAt', 'title', 'severity', 'status'].includes(k))
	if (undefinedFields.length > 0)
		errors.push(`undefined fields: ${undefinedFields}`)

	if (typeof title !== 'string')
		errors.push('"title" must be string')

	if (typeof severity !== 'string' || !['low', 'medium', 'high'].includes(severity))
		errors.push('"severity" must be "low", "medium" or "high"')

	return errors
}

const validatePatchIncidentRequest = (req) => {
	if (Object.keys(req).length === 0)
		return ["empty request body"]

	const { title, severity, status } = req
	const errors = []

	const immutableFields = Object.keys(req).filter(k => ['id', 'createdAt'].includes(k))
	if (immutableFields.length > 0)
		errors.push(`can not set fields: ${immutableFields}`)

	const undefinedFields = Object.keys(req).filter(k => !['id', 'createdAt', 'title', 'severity', 'status'].includes(k))
	if (undefinedFields.length > 0)
		errors.push(`undefined fields: ${undefinedFields}`)

	if (!isNullOrEmpty(title) && typeof title !== 'string')
		errors.push('"title" must be string')

	if (!isNullOrEmpty(severity) && (typeof severity !== 'string' || !['low', 'medium', 'high'].includes(severity)))
		errors.push('"severity" must be "low", "medium" or "high"')

	if (!isNullOrEmpty(status) && (typeof status !== 'string' || !['open', 'acknowledged', 'resolved'].includes(status)))
		errors.push('"status" must be "open", "acknowledged" or "resolved"')

	return errors
}

const createDbClient = () => {
	const connectionString = 'mongodb://root:example@127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=nodejs_incidents'
	return new MongoClient(connectionString)
}



export { getBody, validatePostIncidentRequest, validatePatchIncidentRequest, createDbClient }
