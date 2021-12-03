import React, { useState, useContext, useEffect } from 'react'
import { OAuthConfig } from '../../../unlockTypes'
import LoginPrompt from '../LoginPrompt'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

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
  const { account, signMessage } = useContext(AuthenticationContext)

  const accessDenied = () => {
    closeModal(false, redirectUri)
  }

  const [showLogin, setShowLogin] = useState(false)
  const { clientId } = oAuthConfig
  // What if the user has no account? TODO: allow for the user to signup!

  // TODO: add a timestamp to digest for increased security
  const digest = `Connecting my acccount to ${clientId}.`

  // When the account is changed, make sure we ping!
  useEffect(() => {
    const handleUser = async (account?: string) => {
      if (account) {
        const signedMessage = await signMessage(digest)
        setShowLogin(false)
        console.log(
          'Actually do not redirect just yet if there are memberships to purchase!'
        )

        const code = JSON.stringify({
          d: digest,
          s: signedMessage,
        })

        closeModal(true, redirectUri, {
          code: btoa(code),
          state: oAuthConfig.state,
        })
      }
    }
    handleUser(account)
  }, [account])

  if (showLogin) {
    return (
      <LoginPrompt
        embedded
        showTitle={false}
        unlockUserAccount
        backgroundColor="var(--white)"
        activeColor="var(--offwhite)"
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
