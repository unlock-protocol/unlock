import React, { useState, useContext, useEffect } from 'react'
import { SiweMessage, generateNonce } from 'siwe'
import { OAuthConfig } from '../../../unlockTypes'
import LoginPrompt from '../LoginPrompt'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import UnlockProvider from '../../../services/unlockProvider'

import { SignUp } from '../user-account/SignUp'
import useAccount from '../../../hooks/useAccount'
import { ConfigContext } from '../../../utils/withConfig'
import { useAuthenticateHandler } from '../../../hooks/useAuthenticateHandler'
import { LinkButton } from './FormStyles'

interface OAuthConnectProps {
  oAuthConfig: OAuthConfig
  redirectUri: string
  closeModal: (success: boolean, url: string, queryString?: any) => void
  message?: string
}

const formatMessageToSign = (
  clientId: string,
  address: string,
  statement: string,
  chainId = 1 // Default due compaitibility with existing code.
): string => {
  const nonce = generateNonce()
  const expirationDate = new Date()
  // Add 7 day expiration from today. This will account for months.
  expirationDate.setDate(expirationDate.getDate() + 7)

  const message = new SiweMessage({
    nonce,
    domain: clientId,
    statement: statement.trim(),
    uri: 'https://app.unlock-protocol.com/login',
    version: '1',
    address,
    chainId,
    expirationTime: expirationDate.toISOString(),
  })

  return message.prepareMessage()
}

export const OAuthConnect = ({
  oAuthConfig,
  redirectUri,
  message,
  closeModal,
}: OAuthConnectProps) => {
  const { account, signMessage, isUnlockAccount, network } = useContext(
    AuthenticationContext
  )
  const [showSignMessage, setShowSignMessage] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const { clientId } = oAuthConfig
  const { createUserAccount } = useAccount(account || '', 1)
  const config = useContext(ConfigContext)
  const { authenticateWithProvider } = useAuthenticateHandler({})

  useEffect(() => {
    const handleUser = async (account?: string) => {
      if (account) {
        setShowSignMessage(!isUnlockAccount)
        const digest = formatMessageToSign(
          clientId,
          account,
          message || '',
          network
        )

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

  const createAccount = async (email: string, password: string) => {
    const { passwordEncryptedPrivateKey } = await createUserAccount(
      email,
      password
    )
    const unlockProvider = new UnlockProvider(config.networks[1])

    await unlockProvider.connect({
      key: passwordEncryptedPrivateKey,
      emailAddress: email,
      password,
    })
    authenticateWithProvider('UNLOCK', unlockProvider)
  }

  if (showSignup && !account) {
    return (
      <>
        <h1>Sign-up</h1>
        <SignUp
          createAccount={createAccount}
          showLogin={() => setShowSignup(false)}
        />
        <p>
          Use{' '}
          <LinkButton onClick={() => setShowSignup(false)}>
            crypto wallet
          </LinkButton>
        </p>
      </>
    )
  }

  if (showSignMessage && account) {
    return (
      <>
        <p>Check your wallet to sign a message that will authenticate you.</p>
        <p>You will be redirected to {clientId} after that.</p>
      </>
    )
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
        Connect to your wallet, or{' '}
        <LinkButton onClick={() => setShowSignup(true)}>
          create an account
        </LinkButton>
        .
      </p>
    </LoginPrompt>
  )
}

OAuthConnect.defaultProps = {
  message: '',
}
