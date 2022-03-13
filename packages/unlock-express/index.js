const ethers = require('ethers')
const passportCustom = require('passport-custom')
const hasValidKey = require('./src/hasValidKey')

const CustomStrategy = passportCustom.Strategy

/**
 * Main function that yields the middleware
 * @param {*} defaultPaywallConfig
 * @param {*} passport instance
 * @param {*} config optional configuration object
 * @returns
 */
const configureUnlock = (defaultPaywallConfig, passport, config = {}) => {
  if (!config.providers) {
    // eslint-disable-next-line no-param-reassign
    config.providers = {}
  }

  if (!config.providers[1]) {
    // eslint-disable-next-line no-param-reassign
    config.providers[1] =
      'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
  }

  if (!config.providers[4]) {
    // eslint-disable-next-line no-param-reassign
    config.providers[4] =
      'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
  }

  if (!config.providers[100]) {
    // eslint-disable-next-line no-param-reassign
    config.providers[100] = 'https://rpc.xdaichain.com/'
  }

  if (!config.providers[137]) {
    // eslint-disable-next-line no-param-reassign
    config.providers[137] = 'https://rpc-mainnet.matic.network/'
  }

  /**
   * Helper function to build the checkout URL easily
   * @param {*} paywallConfig
   * @param {*} redirectUri
   * @returns
   */
  const buildCheckoutUrl = (paywallConfig, redirectUri) => {
    const unlockCheckoutBaseUrl = new URL(
      'https://app.unlock-protocol.com/checkout'
    )
    unlockCheckoutBaseUrl.searchParams.append('redirectUri', redirectUri)
    unlockCheckoutBaseUrl.searchParams.append(
      'paywallConfig',
      JSON.stringify(paywallConfig)
    )

    return unlockCheckoutBaseUrl
  }

  /**
   * Returns true if the user has memberships
   */
  const hasValidMembership = async (paywallConfig, ethereumAddress) => {
    const promises = Object.entries(paywallConfig.locks).map(
      async ([lockAddress, { network }]) => {
        // Use global network if not set for lock
        if (!network) {
          // eslint-disable-next-line no-param-reassign
          network = paywallConfig.network
        }
        if (!config.providers[network]) {
          throw new Error(`No provider configured for network ${network}`)
        }
        return hasValidKey(
          config.providers[network],
          lockAddress,
          ethereumAddress
        )
      }
    )
    const validMemberships = await Promise.all(promises)
    return !!validMemberships.find((valid) => valid)
  }

  /**
   * Use the Unlock strategy!
   */
  passport.use(
    'unlock-strategy',
    new CustomStrategy(async (req, done) => {
      const { signature, messageToSign, error } = req.query

      if (error) {
        return done(error, null)
      }

      let userAddress

      if (!req.user) {
        if (!signature) {
          // No logged in user!
          return done(null, null)
        }

        userAddress = ethers.utils.verifyMessage(messageToSign, signature)
      } else {
        userAddress = req.user.address
      }

      const hasUnlocked =
        userAddress &&
        (await hasValidMembership(req.paywallConfig, userAddress))

      if (hasUnlocked) {
        return done(null, {
          address: userAddress,
          signature,
          signedMessage: messageToSign,
        })
      }

      // Authorization failed!
      return done(null, null)
    })
  )

  /**
   * Middeware function, which redirects user to purchase memberships if applicable.
   * @returns
   */
  const membersOnly = (paywallConfig) => async (req, res, next) => {
    const mergedConfig = Object.assign(defaultPaywallConfig, paywallConfig)
    req.paywallConfig = mergedConfig
    passport.authenticate('unlock-strategy', (err, user) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        if (!mergedConfig.messageToSign) {
          // eslint-disable-next-line prettier/prettier
          // eslint-disable-next-line no-console
          console.warn(
            'For security reasons, please consider using a custom to sign message with a nonce and a timestamp for which your application will verify uniqueness and recency.'
          )
          // eslint-disable-next-line no-param-reassign
          mergedConfig.messageToSign = `Please connect your wallet to connect to\n${req.get(
            'host'
          )}.`
        }

        if (!mergedConfig.locks) {
          console.error('Missing locks on configuration! We let the users in.')
          return next()
        }

        const baseUrl = config.baseUrl || `${req.protocol}://${req.get('host')}`
        const redirectUri = new URL(`${baseUrl}${req.originalUrl}`)
        redirectUri.searchParams.append(
          'messageToSign',
          mergedConfig.messageToSign
        )

        const checkoutUrlRedirect = buildCheckoutUrl(
          mergedConfig,
          redirectUri.toString()
        )
        // Go authorize!
        return res.redirect(checkoutUrlRedirect.toString())
      }
      // We have a user that's authorized! Continue :)
      req.login(user, next)
      return next()
    })(req, res, next)
  }

  // Returns the middleware
  return { buildCheckoutUrl, hasValidMembership, membersOnly }
}

module.exports = configureUnlock
