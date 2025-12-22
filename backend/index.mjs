import server from './src/server.mjs'

const hostname = 'localhost'
const port = 3000

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
})
