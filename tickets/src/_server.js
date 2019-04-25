/* eslint no-console: 0 */
const { createServer } = require('http')
const next = require('next')
const { URL } = require('url')

function _server(port, dev) {
  return new Promise((resolve, reject) => {
    const app = next({ dir: `${__dirname}/`, dev, quiet: true })

    app.prepare().then(() => {
      let server = createServer((req, res) => {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}/`)
        const { pathname, query } = parsedUrl
        console.info(`${req.method} ${req.url} > ${res.statusCode} `)
        try {
          if (pathname.match(/\/create/)) {
            app.render(req, res, '/create', Object.assign({}, query))
          } else {
            app.render(req, res, '/home', Object.assign({}))
          }
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
