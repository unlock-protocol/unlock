const { createServer } = require('http')
const { URL } = require('url')
const next = require('next')
const pathMatch = require('path-match')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dir: './src', dev })
const handle = app.getRequestHandler()
const route = pathMatch()

app.prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = new URL(req.url, true)
      const { pathname, query } = parsedUrl

      // assigning `query` into the params means that we still
      // get the query string passed to our application
      const path = pathname.split('/')[1]
      if (path === 'lock') {
        const params = route('/lock/:lockaddress')(pathname)
        app.render(req, res, '/lock', Object.assign(params, query))
      } else if (path === 'demo') {
        const params = route('/demo/:lockaddress')(pathname)
        app.render(req, res, '/demo', Object.assign(params, query))
      } else {
        handle(req, res)
        return
      }
    })
      .listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`) // eslint-disable-line no-console
      })
  })
