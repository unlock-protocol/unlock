import {
  useState,
  createContext,
  useContext,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react'
import { authenticateFromCode, getMemberships, Membership } from './utils'
import { PaywallConfig } from '@unlock-protocol/types'

interface Unlock {
  user: string | null
  signature: string | null
  digest: string | null
  code: string | null
}

/**
 * An internal context
 */
const UnlockContext = createContext<[Unlock, Dispatch<SetStateAction<Unlock>>]>(
  [
    {
      user: null,
      signature: null,
      code: null,
      digest: null,
    },
    () => {},
  ]
)

/**
 * A react hook
 * @param {*} config the paywall config object used for checkout
 * @returns an object
 */
export const useUnlock = (config: PaywallConfig) => {
  const [unlockContext, setUnlockContext] = useContext(UnlockContext)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(false)

  /**
   * Authentication function
   */
  const authenticate = () => {
    let url = new URL('https://app.unlock-protocol.com/checkout')
    url.searchParams.set('client_id', window.location.host)
    url.searchParams.set('redirect_uri', window.location.href)
    window.location.href = url.toString()
  }

  const deAuthenticate = () => {
    setUnlockContext({
      user: null,
      signature: null,
      code: null,
      digest: null,
    })
  }

  /**
   * You can optionnaly pass a different config
   */
  const checkout = (_optionalConfig?: PaywallConfig) => {
    let purchaseConfig = _optionalConfig || config
    purchaseConfig.pessimistic = true // We must wait for tx to succeed before redirecting!
    let url = new URL('https://app.unlock-protocol.com/checkout')
    url.searchParams.set('paywallConfig', JSON.stringify(purchaseConfig))
    let redirectUri = new URL(window.location.href)
    if (unlockContext.code) {
      redirectUri.searchParams.set('code', unlockContext.code)
    }
    url.searchParams.set('redirectUri', redirectUri.toString())
    window.location.href = url.toString()
  }

  /**
   * When the user changes, check if user is authorized
   */
  useEffect(() => {
    const loadMemberships = async () => {
      setLoading(true)
      const _memberships = await getMemberships(config, unlockContext.user!)
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
  const isAuthorized =
    memberships.filter((membership) => {
      return membership.expiration * 1000 > new Date().getTime()
    }).length > 0

  return {
    loading,
    checkout,
    authenticate,
    deAuthenticate,
    isAuthorized,
    memberships,
    user: unlockContext.user,
    code: unlockContext.code,
  }
}

interface UnlockProviderProps {
  children?: ReactNode
  path: string
  push(url: string): void | Promise<void>
}

/**
 * A provider that needs to wrap your application
 * It is required to expose the user context
 * You can pass a `path` and `push` function that respectively
 * expose the current path as well as a push function to update the
 * URL in the browser (useful to cleanup query params).
 */
export const UnlockProvider = ({
  children,
  path,
  push,
}: UnlockProviderProps) => {
  const [context, setContext] = useState<Unlock>({
    user: null,
    signature: null,
    digest: null,
    code: null,
  })

  useEffect(() => {
    let url = new URL(path, window.location.href)
    const urlSearchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(urlSearchParams.entries())
    if (params.code) {
      const { user, signature, digest } = authenticateFromCode(params.code)

      setContext({
        code: params.code,
        user,
        digest,
        signature,
      })

      if (typeof push === 'function') {
        urlSearchParams.delete('code')
        urlSearchParams.delete('state')
        url.search = urlSearchParams.toString()
        push(url.toString())
      }
    }
  }, [path, push])

  return (
    <UnlockContext.Provider value={[context, setContext]}>
      {children}
    </UnlockContext.Provider>
  )
}
