import React, { useState, useContext } from 'react'
import { OAuthConfig } from '../../../unlockTypes'
import LoginPrompt from '../LoginPrompt'
import { AuthenticationContext } from '../Authenticate'
import Loading from '../Loading'

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
  const onProvider = async (provider: any) => {
    const result = await authenticate(
      provider,
      `Connecting my acccount to ${clientId}.`
    )
    // Here we need to wait for the parent coponent to re-render because authenticate sets a bunch of things!
    if (result) {
      setShowLogin(false)
      console.log(
        'Redirect back! Make sure to include code (signed message) and state too!'
      )
      console.log(
        'Actually do not redirect just yet if there are memberships to purchase!'
      )
      closeModal(true, redirectUri, {
        code: result.signedMessage,
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
        <button onClick={onAllowed}>Allow</button> &nbsp;
        <button onClick={accessDenied}>Deny</button>
      </>
    )
  }

  // We should probably have redireccted!
  return <Loading />
}
