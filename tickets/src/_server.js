/* eslint no-console: 0 */
const { createServer } = require('http')
const next = require('next')

function _server(port, dev) {
  return new Promise((resolve, reject) => {
    const app = next({ dir: `${__dirname}/`, dev, quiet: true })

    app.prepare().then(() => {
      let server = createServer((req, res) => {
        console.info(`${req.method} ${req.url} > ${res.statusCode} `)
        try {
          app.render(req, res, '/home', Object.assign({}))
        } catch (error) {
          reject(error)
        }
      }).listen(port, err => {
        if (err) throw reject(err)
        resolve([server, app])
      })
    })
  })
}

module.exports = _server
