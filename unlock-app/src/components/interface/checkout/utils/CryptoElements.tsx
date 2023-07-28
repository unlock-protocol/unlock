// https://stripe.com/docs/crypto/quickstart

import { createContext, useEffect, useState, useRef, useContext } from 'react'

interface CryptoElementsContext {
  onramp: any
}

// ReactContext to simplify access of StripeOnramp object
const CryptoElementsContext = createContext<CryptoElementsContext | undefined>(
  undefined
)
CryptoElementsContext.displayName = 'CryptoElementsContext'

interface CryptoElementsProps {
  stripeOnramp: any
  children: React.ReactNode
}

export const CryptoElements = ({
  stripeOnramp,
  children,
}: CryptoElementsProps) => {
  const [ctx, setContext] = useState(() => ({
    onramp: null,
  }))

  useEffect(() => {
    let isMounted = true

    Promise.resolve(stripeOnramp).then((onramp) => {
      if (onramp && isMounted) {
        setContext((ctx) => (ctx.onramp ? ctx : { onramp }))
      }
    })

    return () => {
      isMounted = false
    }
  }, [stripeOnramp])

  return (
    <CryptoElementsContext.Provider value={ctx}>
      {children}
    </CryptoElementsContext.Provider>
  )
}

// React hook to get StripeOnramp from context
export const useStripeOnramp = () => {
  const context = useContext(CryptoElementsContext)
  return context?.onramp
}

// React element to render Onramp UI
const useOnrampSessionListener = (
  type: string,
  session: any,
  callback: any
) => {
  useEffect(() => {
    if (session && callback) {
      const listener = (e: any) => callback(e.payload)
      session.addEventListener(type, listener)
      return () => {
        session.removeEventListener(type, listener)
      }
    }
    return () => {}
  }, [session, callback, type])
}

interface OnrampElementProps {
  clientSecret: string
  appearance: any
  onChange: (payload: any) => void
}

export const OnrampElement = ({
  clientSecret,
  appearance,
  onChange,
  ...props
}: OnrampElementProps) => {
  const stripeOnramp = useStripeOnramp()
  const onrampElementRef = useRef<HTMLDivElement | null>(null)
  const [session, setSession] = useState()

  const appearanceJSON = JSON.stringify(appearance)
  useEffect(() => {
    const containerRef = onrampElementRef.current
    if (containerRef) {
      // NB: ideally we want to be able to hot swap/update onramp iframe
      // This currently results a flash if one needs to mint a new session when they need to udpate fixed transaction details
      containerRef.innerHTML = ''

      if (clientSecret && stripeOnramp) {
        setSession(
          stripeOnramp
            .createSession({
              clientSecret,
              appearance: appearanceJSON ? JSON.parse(appearanceJSON) : {},
            })
            .mount(containerRef)
        )
      }
    }
  }, [appearanceJSON, clientSecret, stripeOnramp])

  useOnrampSessionListener('onramp_session_updated', session, onChange)

  return <div {...props} ref={onrampElementRef}></div>
}
