import { createServer } from './src/server.mjs'
import { createDbClient } from './src/utils.mjs'
import wss from './src/websocket.mjs'

const hostname = 'localhost'
const port = 3000

createServer(wss, createDbClient)
	.listen(port, hostname, () => {
		console.log(`Server running at http://${hostname}:${port}/`)
	})
