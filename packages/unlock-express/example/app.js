/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
const express = require('express')
const passport = require('passport')

// 
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


const configureUnlock = require('@unlock-protocol/unlock-express')

const app = express()
const port = 3000

const { membersOnly } = configureUnlock(
  {
    locks: {
      '0xafa8fE6D93174D17D98E7A539A90a2EFBC0c0Fc1': {
        network: 4,
      },
    },
  },
  passport,
)
app.get('/', (req, res) => {
  res.send('Welcome! <a href="/members">members only</a> | <a href="/members2">members only</a>')
})

// Members only page
app.get('/members', membersOnly({}), (req, res) => {
  res.send('Secret stuff! <a href="/">go home</a>')
})

// Members only page
app.get('/members2', membersOnly({
  locks: {
    "0xd390FD23719e26E1596D45633654D5d81738fF5d": {
      network: 4
    }
  }
}), (req, res) => {
  res.send('Secret stuff! <a href="/">go home</a>')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
