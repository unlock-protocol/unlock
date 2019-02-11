const host = process.env.UNLOCK_HOST || '127.0.0.1'
const port = process.env.UNLOCK_PORT || 3000

module.exports = (path = '/') => `http://${host}:${port}${path}`
