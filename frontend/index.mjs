import { createServer } from 'node:http'
import fs from 'node:fs'

const hostname = 'localhost'
const port = 3001

const html = fs.readFileSync('index.html', 'utf8')

createServer((req, res) => {
	console.log(req.method, req.url, req.headers)
	res.statusCode = 200
	res.setHeader('Content-Type', 'text/html')
	res.end(html)
})
	.listen(port, hostname, () => {
		console.log(`Frontend server running at http://${hostname}:${port}/`)
	})
