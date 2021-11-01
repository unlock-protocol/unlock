/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
const express = require('express')
const cookieParser = require('cookie-parser')

const configureUnlock = require('@unlock-protocol/unlock-express')

const app = express()
const port = 3000

// We will use cookies to kep track of user address, but you can usee any oter mecanism!
app.use(cookieParser())

const { membersOnly } = configureUnlock(
  {
    // Required: Yield a config for the paywall based on the request. This allows for customization of the config based on the route or other elements.
    yieldPaywallConfig: async (req) => {
      return {
        locks: {
          '0xafa8fE6D93174D17D98E7A539A90a2EFBC0c0Fc1': {
            network: 4,
          },
        },
      }
    },
    // Required: Yields the current visitors ethereum address (required). (could look up in database based on user info... etc)
    getUserEthereumAddress: async (req) => {
      return req.cookies.userAddress
    },
    // Required: Saves the address for the current user. Signature + signede message is included for additional check. See ethers.utils.verifyMessage for details.
    updateUserEthereumAddress: async (
      req,
      res,
      address,
      signature,
      message
    ) => {
      res.cookie('userAddress', address)
    },
  },
  app
)
app.get('/', (req, res) => {
  res.send('Welcome! <a href="/members">members only</a>')
})

// Members only page
app.get('/members', membersOnly(), (req, res) => {
  res.send('Secret stuff! <a href="/logout">logout</a>')
})

app.get('/logout', (req, res) => {
  res.clearCookie('userAddress')
  res.redirect('/')
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
