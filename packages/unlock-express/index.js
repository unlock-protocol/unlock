const ethers = require('ethers')
const keyExpirationFor = require('./src/keyExpirationFor')

const unlockCheckoutBaseUrl = new URL(
  'https://app.unlock-protocol.com/checkout'
)
/**
 * Main function that yields the middleware
 * @param {*} config
 * @param {*} app
 * @returns
 */
const configureUnlock = (config, app) => {
  if (!config.baseAuthRedirectPath) {
    // eslint-disable-next-line no-param-reassign
    config.baseAuthRedirectPath = '/unlock-callback'
  }

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

  if (!config.optionalRedirectParams) {
    // eslint-disable-next-line no-param-reassign
    config.optionalRedirectParams = () => ({})
  }

  if (!config.onFailure) {
    // eslint-disable-next-line no-param-reassign
    config.onFailure = (req, res, error) => {
      res.send(
        `It looks like we could not confirm your membership status! Please try again. ${error}. <a href="/">Home</a>`
      )
    }
  }

  app.get(config.baseAuthRedirectPath, async (req, res) => {
    const { signature, originalUrl, error } = req.query

    if (error) {
      return config.onFailure(req, res, error)
    }

    const paywallConfig = await config.yieldPaywallConfig(req)
    if (!paywallConfig.messageToSign) {
      paywallConfig.messageToSign = 'Please connect your wallet'
    }
    const userAddress = ethers.utils.verifyMessage(
      paywallConfig.messageToSign,
      signature
    )

    await config.updateUserEthereumAddress(
      req,
      res,
      userAddress,
      signature,
      paywallConfig.messageToSign
    )

    return res.redirect(originalUrl)
  })

  /**
   * Helper function to build the checkout URL easily
   * @param {*} paywallConfig
   * @param {*} redirectUri
   * @returns
   */
  const buildCheckoutUrl = (paywallConfig, redirectUri) => {
    unlockCheckoutBaseUrl.searchParams.append('redirectUri', redirectUri)
    unlockCheckoutBaseUrl.searchParams.append(
      'paywallConfig',
      JSON.stringify(paywallConfig)
    )

    return unlockCheckoutBaseUrl
  }

  /**
   * Returns true if the user has memberships
   * @param {*} memberships
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
        // Query chain (using balanceOf)
        return keyExpirationFor(
          config.providers[network],
          lockAddress,
          ethereumAddress
        )
      }
    )
    const exirations = await Promise.all(promises)
    return !!exirations.find(
      (expiration) => expiration * 1000 > new Date().getTime()
    )
  }

  /**
   * Middeware function, which redirects user to purchase membership if applicable.
   * @returns
   */
  const membersOnly = (unauthenticatedHander) => async (req, res, next) => {
    const ethereumAddress = await config.getUserEthereumAddress(req)
    const paywallConfig = await config.yieldPaywallConfig(req)
    if (!paywallConfig.messageToSign) {
      paywallConfig.messageToSign = 'Please connect your wallet'
    }
    if (!paywallConfig.locks) {
      throw new Error('Missing locks on configuration!')
    }

    const hasUnlocked =
      ethereumAddress &&
      (await hasValidMembership(paywallConfig, ethereumAddress))

    if (hasUnlocked) {
      return next()
    }

    const baseUrl = config.baseUrl || `${req.protocol}://${req.get('host')}`

    // Build the redirect url
    const redirectUriParams = await config.optionalRedirectParams(req)
    const redirectUri = new URL(`${baseUrl}${config.baseAuthRedirectPath}`)
    const searchParams = new URLSearchParams({
      ...redirectUriParams,
    })
    // eslint-disable-next-line no-restricted-syntax
    for (const param of searchParams) {
      redirectUri.searchParams.append(param, searchParams[param])
    }
    redirectUri.searchParams.append('originalUrl', req.originalUrl)
    const checkoutUrlRedirect = buildCheckoutUrl(
      paywallConfig,
      redirectUri.toString()
    )

    // If we have a handler, let's use it!
    if (unauthenticatedHander) {
      return unauthenticatedHander(checkoutUrlRedirect, req, res, next)
    }

    // This allows Javascript Fetch to be able to read from the body since it does not yield the `Location` in case of redirect...
    res.send(checkoutUrlRedirect.toString())
    return res.redirect(checkoutUrlRedirect.toString())
  }

  // Returns the middleware
  return { buildCheckoutUrl, hasValidMembership, membersOnly }
}
module.exports = configureUnlock
