/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
const express = require('express')
const passport = require('passport')
const session = require('express-session')

// Passport vanilla configuration
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

const configureUnlock = require('@unlock-protocol/unlock-express')

const app = express()
const port = 3000

app.use(
  session({
    secret: 'right click download',
  })
)

app.use(passport.session()) // persistent login session

const { membersOnly } = configureUnlock(
  {
    locks: {
      '0xafa8fE6D93174D17D98E7A539A90a2EFBC0c0Fc1': {
        network: 4,
      },
    },
  },
  passport
)

// Public page!
app.get('/', (req, res) => {
  res.send('Welcome! <a href="/members">members only</a>')
})

// Members only page
// You could pass a custom paywallConfig object to the `membersOnly` middleware, or
// even wrap that middleware into a custom one if you want to customize the paywallConfig
// based on the request object.
app.get('/members', membersOnly(), (req, res) => {
  res.send('Secret stuff! <a href="/">go home</a>')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
