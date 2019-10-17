/* eslint no-console: 0 */
const { createServer } = require('http')
const { URL } = require('url')
const next = require('next')
const pathMatch = require('path-match')

function _server(port, dev) {
  return new Promise(async (resolve, reject) => {
    const app = next({ dir: `${__dirname}/`, dev, quiet: true })
    const handle = app.getRequestHandler()
    const route = pathMatch()

    await app.prepare()

    let server = createServer((req, res) => {
      console.info(`${req.method} ${req.url} > ${res.statusCode} `)
      try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}/`)
        const { pathname, query } = parsedUrl

        // assigning `query` into the params means that we still
        // get the query string passed to our application
        const path = pathname.split('/')[1]
        if (path === '') {
          app.render(req, res, '/home', {})
        } else if (path === 'blog') {
          const params = route('/blog/:slug')(pathname)
          if (params.slug) {
            if (isNaN(params.slug)) {
              app.render(req, res, '/post', Object.assign(params, query))
            } else {
              app.render(req, res, '/blog', Object.assign(params, query))
            }
          } else {
            app.render(req, res, '/blog', Object.assign(params, query))
          }
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
}

module.exports = _server
