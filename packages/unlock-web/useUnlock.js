import { useState, Context, createContext, useContext, useEffect } from "react"
import { authenticateFromCode, getMemberships } from './lib'

/**
 * An internal context
 */
const UnlockContext = createContext({
  deauthenticate: () => { },
  user: null,
  signature: null,
  digest: null,
  code: null, // Kept to keep user logged in when they make purchases!
})

/**
 * A react hook
 * @param {*} config the paywall config object used for checkout
 * @returns an object
 */
export const useUnlock = (config) => {
  const unlockContext = useContext(UnlockContext)
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(false)


  /**
   * Authentication function
   */
  const authenticate = () => {
    let url = new URL("https://app.unlock-protocol.com/checkout");
    url.searchParams.set('client_id', window.location.host);
    url.searchParams.set('redirect_uri', window.location.href);
    window.location = url.toString()
  }

  /**
   * You can optionnaly pass a different config
   */
  const checkout = (_optionalConfig = null) => {
    let purchaseConfig = _optionalConfig || config
    purchaseConfig.pessimistic = true // We must wait for tx to succeed before redirecting!
    let url = new URL("https://app.unlock-protocol.com/checkout");
    url.searchParams.set('paywallConfig', JSON.stringify(purchaseConfig));
    let redirectUri = new URL(window.location.href)
    if (unlockContext.code) {
      redirectUri.searchParams.set('code', unlockContext.code)
    }
    url.searchParams.set('redirectUri', redirectUri.toString());
    window.location = url.toString()
  }

  /**
   * When the user changes, check if user is authorized
   */
  useEffect(() => {
    const loadMemberships = async () => {
      setLoading(true)
      const _memberships = await getMemberships(config, unlockContext.user)
      setMemberships(_memberships)
      setLoading(false)
    }

    if (unlockContext.user && config.locks) {
      loadMemberships()
    } else if (memberships.length > 0) {
      setMemberships([])
    }
  }, [unlockContext.user])

  /** Syntactic sugar */
  const isAuthorized = memberships.filter((membership) => { return membership.expiration * 1000 > new Date().getTime() }).length > 0

  return {
    loading,
    checkout,
    authenticate,
    isAuthorized,
    memberships,
    user: unlockContext.user,
    code: unlockContext.code,
  }
}

/**
 * A provider that needs to wrap your application
 * It is required to expose the user context
 * You can pass a `path` and `push` function that respectively 
 * expose the current path as well as a push function to update the
 * URL in the browser (useful to cleanup query params).
 * @param {*} param0 
 * @returns 
 */
export const UnlockProvider = ({ children, path, push }) => {
  const [context, setContext] = useState({
    deauthenticate: () => { },
    user: null,
    signature: null,
    digest: null,
    code: null
  })

  useEffect(() => {
    let url = new URL(path, window.location)
    const urlSearchParams = new URLSearchParams(url.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if (params.code) {
      const { user, signature, digest } = authenticateFromCode(params.code)
      setContext({
        deauthenticate: () => setContext({}),
        code: params.code,
        user,
        digest,
        signature
      })
      if (typeof push === 'function') {
        urlSearchParams.delete('code')
        urlSearchParams.delete('state')
        url.search = urlSearchParams.toString();
        push(url.toString())
      }
    }
  }, [path, push])


  return <UnlockContext.Provider value={context}>
    {children}
  </UnlockContext.Provider>
}