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
  const { account, signMessage, isUnlockAccount } = useContext(AuthenticationContext)
  const [showSignMessage, setShowSignMessage] = useState(false)

  const { clientId } = oAuthConfig

  const digest = `Connecting my acccount to ${clientId}.`

  useEffect(() => {
    const handleUser = async (account?: string) => {
      if (account) {
        setShowSignMessage(!isUnlockAccount)
        const signedMessage = await signMessage(digest)
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

  if (showSignMessage) {
    return <>
    <p>Please check your wallet to sign a message that will authenticate you.</p>
    <p>You will be redirected to {clientId} after that.</p>
    </>
  }

  return (
    <LoginPrompt
      embedded
      showTitle={false}
      unlockUserAccount
      backgroundColor="var(--white)"
      activeColor="var(--offwhite)"
    >
      <p>
        The application {clientId} wants to identify you and access your
        membership status. 
      </p>
      <p>
        Please connect to your wallet, or <a>create an account</a>.
      </p>
    </LoginPrompt>
  )



  // We should probably have redireccted!
  return <Loading />
}
