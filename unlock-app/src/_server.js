const { createServer } = require('http')
const { URL } = require('url')
const next = require('next')
const pathMatch = require('path-match')

function _server(port, dev) {
  return new Promise((resolve, reject) => {
    const app = next({ dir: `${__dirname}/`, dev })
    const handle = app.getRequestHandler()
    const route = pathMatch()

    app.prepare().then(() => {
      let server = createServer((req, res) => {
        try {
          const parsedUrl = new URL(req.url, `http://${req.headers.host}/`)
          const { pathname, query } = parsedUrl

          // assigning `query` into the params means that we still
          // get the query string passed to our application
          const path = pathname.split('/')[1]
          if (path === 'paywall') {
            const params = route('/paywall/:lockAddress')(pathname)
            app.render(req, res, '/paywall', Object.assign(params, query))
          } else if (path === 'demo') {
            const params = route('/demo/:lockaddress')(pathname)
            app.render(req, res, '/demo', Object.assign(params, query))
          } else {
            handle(req, res)
            return
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
