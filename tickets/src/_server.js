/* eslint no-console: 0 */
const { createServer } = require('http')
const next = require('next')
const { URL } = require('url')
const pathMatch = require('path-match')

function _server(port, dev) {
  return new Promise((resolve, reject) => {
    const app = next({ dir: `${__dirname}/`, dev, quiet: true })
    const route = pathMatch()

    app.prepare().then(() => {
      let server = createServer((req, res) => {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}/`)
        const { pathname, query } = parsedUrl
        console.info(`${req.method} ${req.url} > ${res.statusCode} `)
        try {
          if (pathname.match(/\/create/)) {
            app.render(req, res, '/create', Object.assign({}, query))
          } else if (pathname.match('/event')) {
            const params = route('/event/:lockAddress')(pathname)
            app.render(req, res, '/event', Object.assign(params, query))
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
