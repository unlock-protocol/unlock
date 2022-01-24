import React, { useState, useContext, useEffect } from 'react'
import { OAuthConfig } from '../../../unlockTypes'
import LoginPrompt from '../LoginPrompt'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

import Loading from '../Loading'

interface OAuthConnectProps {
  oAuthConfig: OAuthConfig
  redirectUri: string
  closeModal: (success: boolean, url: string, queryString?: any) => void
  message?: string
}

const formatMessageToSign = (clientId: string, address: string, message: string): string => {
  const nonce = Math.random().toString(36).substring(2, 10)
  const issuedAt = new Date().toISOString()
  return `
${clientId} wants you to sign in with your Ethereum account:
${address}

${message ? message+"x\n" : ""}URI: https://app.unlock-protocol.com/login
Version: 1
Nonce: ${nonce}
Issued At: ${issuedAt}
`
}

export const OAuthConnect = ({
  oAuthConfig,
  redirectUri,
  message,
  closeModal,
}: OAuthConnectProps) => {
  const { account, signMessage, isUnlockAccount } = useContext(AuthenticationContext)
  const [showSignMessage, setShowSignMessage] = useState(false)

  const { clientId } = oAuthConfig


  useEffect(() => {
    const handleUser = async (account?: string) => {
      if (account) {
        setShowSignMessage(!isUnlockAccount)
        const digest = formatMessageToSign(clientId, account, message || '')

        try {
          const signedMessage = await signMessage(digest)

          const code = JSON.stringify({
            d: digest,
            s: signedMessage,
          })
  
          closeModal(true, redirectUri, {
            code: btoa(code),
            state: oAuthConfig.state,
          })
        } catch (error) {
          console.error(error)
          closeModal(false, redirectUri)
        }
      }
    }
    handleUser(account)
  }, [account])

  if (showSignMessage && account) {
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
