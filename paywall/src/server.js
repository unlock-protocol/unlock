/* eslint no-console: 0 */
const server = require('./_server')

const port = parseInt(process.env.PORT, 10) || 3001
const dev = process.env.NODE_ENV !== 'production'

return server(port, dev)
  .then(() => {
    console.log(`> Ready on http://localhost:${port}`)
  })
  .catch((error) => {
    console.error(error)
  })
