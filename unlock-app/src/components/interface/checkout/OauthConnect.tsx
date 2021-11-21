import React, { useState, useContext } from 'react'
import { OAuthConfig } from '../../../unlockTypes'
import LoginPrompt from '../LoginPrompt'
import { AuthenticationContext } from '../Authenticate'
import Loading from '../Loading'
import { Button, NeutralButton } from './FormStyles'

interface OAuthConnectProps {
  oAuthConfig: OAuthConfig
  redirectUri: string
  closeModal: (success: boolean, url: string, queryString?: any) => void
}

export const OAuthConnect = ({
  oAuthConfig,
  redirectUri,
  closeModal,
}: OAuthConnectProps) => {
  const [allowed, setAllowed] = useState(false)
  const { authenticate, account } = useContext(AuthenticationContext)

  const accessDenied = () => {
    closeModal(false, redirectUri)
  }

  const [showLogin, setShowLogin] = useState(false)
  const { clientId } = oAuthConfig
  // What if the user has no account?

  // TODO: add a timestamp to digest for increased security
  const digest = `Connecting my acccount to ${clientId}.`

  const onProvider = async (provider: any) => {
    const result = await authenticate(provider, digest)
    // Here we need to wait for the parent coponent to re-render because authenticate sets a bunch of things!
    if (result) {
      setShowLogin(false)
      console.log(
        'Actually do not redirect just yet if there are memberships to purchase!'
      )

      const code = JSON.stringify({
        d: digest,
        s: result.signedMessage,
      })

      closeModal(true, redirectUri, {
        code: btoa(code),
        state: oAuthConfig.state,
      })
    }
  }
  if (showLogin) {
    return (
      <LoginPrompt
        embedded
        showTitle={false}
        unlockUserAccount
        backgroundColor="var(--white)"
        activeColor="var(--offwhite)"
        onProvider={onProvider}
      >
        Please connect to your account:
      </LoginPrompt>
    )
  }

  const onAllowed = () => {
    setAllowed(true)
    setShowLogin(true)
  }

  if (!allowed || !account) {
    return (
      <>
        <p>
          The application {clientId} wants to identify you and access your
          membership status.
        </p>
        <Button onClick={onAllowed}>Allow</Button>
        <NeutralButton onClick={accessDenied}>Deny</NeutralButton>
      </>
    )
  }

  // We should probably have redireccted!
  return <Loading />
}
