# unlock-express

An express plugin to add Locks to express applications. This enables server-side locking of resources/routes in order to make sure only actual (paying) members can access/view them.

[More details in our docs](https://docs.unlock-protocol.com/developers/tutorials/backend-locking-with-express.js).

# Usage

Install:

`npm install @unlock-protocol/unlock-express`

Configure plugin:

```javascript
const { membersOnly, hasValidMembership, buildCheckoutUrl } = configureUnlock({
  // Yield a config for the paywall based on the req. This allows for customization of the config based on the route or other elements (required) See https://docs.unlock-protocol.com/developers/paywall/configuring-checkout
  yieldPaywallConfig : async (req) => {
   return {
    locks: {
      '0xafa8fE6D93174D17D98E7A539A90a2EFBC0c0Fc1': {
        network: 4
      }
    }
   }
  },
  // Yields the current user ethereum address (required)
  getUserEthereumAddress: async (req) => {
    return req.cookies.userAddress
  },
  // Saves the address for the current user (required). You can use signature
  updateUserEthereumAddress: async (req, res, address, signature) => {
    res.cookie('userAddress', address)
  },

  // Advanced/optional stuff:
  // Easily customize the redirect URL (optional)
  baseAuthRedirectPath: `/my-callback`,

  // Customize behavior on failure (usually when the user refused to purchase a membership!)
  onFailure: async (req, res) => {
    res.send('Please make sure you purchase the membership!')
  },

  // Customize the params on redirect URL: useful to identify the user for updateUserEthereumAddress and getUserEthereumAddress (optional)
  optionalRedirectParams: async (req) => {
    return {
      // Probably set a user id for example
    }
  },

  // Customize te RPC provider URLs
  providers: {
    1: 'provider URL',
    4: 'provider URL',
    100: 'provider URL',
    137: 'provider URL',
  }

  // Customise the baseUrl for the application (do not include a path!)
  baseUrl: 'https://myapp.tld:port'
}, app)
```

Add to routes:

```javascript
app.get('/members', membersOnly(), (req, res) => {
  ...
})
```

The `membersOnly()` middleware will handle ensuring that the current visitor is authentitcated AND has access to the resource based on the config set above. If not, by default it will redirect the user so they authenticate. Optionnaly you can pass an express handler to `membersOnly` that will be called with the redirect URL, the request, response and next arguments if you want to manually handle redirects.

Additionally the plugin config exports to other functions: `hasValidMembership` and `buildCheckoutUrl` that can be used to respectively check if a address has any valid membership for a specific paywall config, and build a checkout URL for a paywall config.

See `/example` for more details.
