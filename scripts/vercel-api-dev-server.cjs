const http = require('node:http')

const port = Number(process.env.PORT) || 3201

const server = http.createServer((_req, res) => {
  res.statusCode = 404
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end('Not Found')
})

server.listen(port)

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
  })
}
