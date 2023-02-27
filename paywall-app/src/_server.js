/* eslint no-console: 0 */
const { createServer } = require('http')
const { URL } = require('url')
const next = require('next')
const pathMatch = require('path-match')

function _server(port, dev) {
  return new Promise((resolve, reject) => {
    const app = next({ dir: __dirname, dev, quiet: true })
    const route = pathMatch()

    app.prepare().then(() => {
      const server = createServer((req, res) => {
        console.info(`${req.method} ${req.url} > ${res.statusCode} `)
        try {
          const parsedUrl = new URL(req.url, `http://${req.headers.host}/`)
          const { pathname, query } = parsedUrl

          // assigning `query` into the params means that we still
          // get the query string passed to our application
          if (pathname.match(/^\/0x/)) {
            const params = route('/:lockAddress/:redirect?')(pathname)
            app.render(req, res, '/paywall', Object.assign(params, query))
          } else if (pathname.match('/newdemo')) {
            app.render(req, res, '/newdemo', { ...query })
          } else if (pathname.match('/checkout')) {
            app.render(req, res, '/checkout', { ...query })
          } else {
            app.render(req, res, '/home', { ...query })
          }
        } catch (error) {
          reject(error)
        }
      }).listen(port, (err) => {
        if (err) throw reject(err)
        resolve([server, app])
      })
    })
  })
}

module.exports = _server
