# unlock-express

An express plugin to add locks to express applications and **token gate** them easily! This enables server-side locking of resources/routes in order to make sure only actual members can access/view them.

This plugin plugin actually implements a Passport strategy and your application cann then easily leverage all of the passport capabilities (session storage... etc).

[More details in our docs](https://docs.unlock-protocol.com/developers/tutorials/backend-locking-with-express.js).

# Usage

Install:

`npm install @unlock-protocol/unlock-express`

Configure plugin:

```javascript
const { membersOnly, hasValidMembership, buildCheckoutUrl } = configureUnlock({
    locks: {
      '0xafa8fE6D93174D17D98E7A539A90a2EFBC0c0Fc1': {
        network: 4
      }
    }
  },
  passport, // the passport instance
  {
    // (advanced, optional) config object
    // Customize te RPC provider URLs
    providers: {
      1: 'provider URL',
      4: 'provider URL',
      100: 'provider URL',
      137: 'provider URL',
    },
    // Customize the baseUrl for the application (do not include a path!)
    baseUrl: 'https://myapp.tld:port'
  }
})
```

Add to routes:

```javascript
app.get('/members', membersOnly(), (req, res) => {
  ...
})
```

The `membersOnly()` middleware will handle ensuring that the current visitor is authentitcated AND has access to the resource based on the config set above. If not, by default it will redirect the user so they authenticate and prove their ownership of a valid membership token.

Additionally the plugin config exports to other functions: `hasValidMembership` and `buildCheckoutUrl` that can be used to respectively check if a address has any valid membership for a specific paywall config, and build a checkout URL for a paywall config.

See `/example` for more details.

Note: Unlock also supports [mapping to existing NFT contracts](https://unlock-protocol.com/blog/bring-your-own-nft), so you can token gate your application with _any_ NFT contract!
