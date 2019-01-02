
const host = process.env.UNLOCK_HOST || '127.0.0.1'

module.exports = (path = '/') => (`http://${host}:3000${path}`)