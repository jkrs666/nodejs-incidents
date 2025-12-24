import { createServer } from './src/server.mjs'
import { createDbClient } from './src/utils.mjs'
import wss from './src/websocket.mjs'

const hostname = '0.0.0.0'
const port = 3000

const db = createDbClient()
createServer(wss, db)
	.listen(port, hostname, () => {
		console.log(`Server running at http://${hostname}:${port}/`)
	})
