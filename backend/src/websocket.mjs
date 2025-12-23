import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 9001 })

wss.on('connection', ws => {
	ws.on('message', message => {
		console.log('received:', message)
	})

	ws.on('error', error => {
		console.log('error:', error)
	})
})

wss.broadcastIncident = (incident) => {
	const json = JSON.stringify(incident)
	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN)
			console.log(json)
		client.send(json)
	})
}

export default wss
