import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 9001 })

wss.on('connection', (ws, req) => {
	const origin = req.headers.origin;
	const allowedOrigins = ['http://localhost:3001'];

	if (!allowedOrigins.includes(origin)) {
		console.log(`Rejected WebSocket connection from origin: ${origin}`);
		ws.close(1008, 'Origin not allowed');
		return;
	}

	console.log(`Accepted WebSocket connection from: ${origin}`);

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
		if (client.readyState === WebSocket.OPEN) {
			console.log(json)
			client.send(json)
		}
	})
}

export default wss
