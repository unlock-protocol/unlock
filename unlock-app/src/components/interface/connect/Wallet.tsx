import { LoginModal, usePrivy } from '@privy-io/react-auth'
import { Placeholder } from '@unlock-protocol/ui'
import { useEffect, useRef } from 'react'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export const ConnectWallet = () => {
  const { authenticated: privyAuthenticated, ready: privyReady } = usePrivy()
  const { signInWithPrivy, account, onSignedInWithPrivy } = useAuthenticate()
  const isSigningIn = useRef(false)

  useEffect(() => {
    if (privyReady && !isSigningIn.current) {
      signInWithPrivy()
      isSigningIn.current = true
    }
  }, [privyReady, isSigningIn, signInWithPrivy])

  useEffect(() => {
    if (privyAuthenticated) {
      if (!account) {
        isSigningIn.current = true
        onSignedInWithPrivy()
      } else {
        // Privy signed in, locksmith signed in... why are we opening this?
      }
    }
  }, [privyAuthenticated, account, onSignedInWithPrivy])

  if (privyAuthenticated) {
    if (!account) {
      return (
        <Placeholder.Root>
          <Placeholder.Line size="sm" />
        </Placeholder.Root>
      )
    } else {
      return <div>Done!</div>
    }
  }
  return <LoginModal open={true} />
}
