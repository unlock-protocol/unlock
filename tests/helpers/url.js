const host = process.env.UNLOCK_HOST || '127.0.0.1'
const port = process.env.UNLOCK_PORT || 3000
const paywall = process.env.PAYWALL_URL || '127.0.0.1:3001'

module.exports = {
  main: (path = '/') => `http://${host}:${port}${path}`,
  paywall: (path = '/') => `${paywall}/${path}`,
}
