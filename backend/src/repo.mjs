import { ObjectId } from 'mongodb'

const insertIncident = async (db, incident) =>
	await db
		.db('app')
		.collection('incidents')
		.insertOne(incident)

const updateIncident = async (db, id, updates) => {
	const incident = await db
		.db('app')
		.collection('incidents')
		.findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{ $set: updates },
			{ returnDocument: "after" }
		)
	return incident === null ? null : mapIncident(incident)
}

const getIncidentById = async (db, id) => {
	const incident = await db
		.db('app')
		.collection('incidents')
		.findOne({ _id: new ObjectId(id) })
	return incident === null ? null : mapIncident(incident)
}

const getAllIncidents = async (db) =>
	(await db
		.db('app')
		.collection('incidents')
		.find()
		.toArray())
		.map(mapIncident)

const mapIncident = (document) => {
	return {
		id: document._id,
		createdAt: document._id.getTimestamp(),
		title: document.title,
		severity: document.severity,
		status: document.status,
	}
}

export default {
	insertIncident, updateIncident, getIncidentById, getAllIncidents
}
