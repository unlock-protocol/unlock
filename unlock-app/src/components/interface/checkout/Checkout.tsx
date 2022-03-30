import React, {
  useState,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { RoundedLogo } from '../Logo'
import { MetadataForm } from './MetadataForm'

import { ConfigContext } from '../../../utils/withConfig'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'
import CheckoutWrapper from './CheckoutWrapper'
import CheckoutContainer from './CheckoutContainer'
import { Locks } from './Locks'
import { CallToAction } from './CallToAction'
import Loading from '../Loading'
import LoginPrompt from '../LoginPrompt'

import CheckoutMethod from './CheckoutMethod'
import CryptoCheckout from './CryptoCheckout'
import CardCheckout from './CardCheckout'
import CardConfirmationCheckout from './CardConfirmationCheckout'
import ClaimMembershipCheckout from './ClaimMembershipCheckout'
import NewAccountCheckout from './NewAccountCheckout'
import { pageTitle } from '../../../constants'
import { EnjoyYourMembership } from './EnjoyYourMembership'
import LogIn from '../LogIn'
import { useAutoLogin } from '../../../hooks/useAutoLogin'

import {
  UserInfo,
  TransactionInfo,
} from '../../../hooks/useCheckoutCommunication'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

import { PaywallConfig, OAuthConfig } from '../../../unlockTypes'
import { OAuthConnect } from './OauthConnect'

interface CheckoutProps {
  emitCloseModal: (success: boolean) => void
  emitTransactionInfo: (info: TransactionInfo) => void
  emitUserInfo: (info: UserInfo) => void
  web3Provider: any
  paywallConfig?: PaywallConfig
  oAuthConfig?: OAuthConfig
  redirectUri?: string
  defaultState: string
}

const keysReducer = (state: any, key: any) => {
  // Keeps track of all the keys, by lock
  if (key === -1) {
    return {}
  }
  // Invalid key: don't change the state
  if (!key) {
    return {
      ...state,
    }
  }
  return {
    ...state,
    [key.lock]: key,
  }
}

const hasValidMembership = (keys: Array<any>) => {
  const now = new Date().getTime() / 1000
  return !!(
    Object.values(keys).filter(
      ({ expiration }) => expiration === -1 || expiration > now
    ).length > 0
  )
}

const hasPendingMembership = (keys: Array<any>) => {
  return !!(
    Object.values(keys).filter(({ expiration }) => expiration == Infinity)
      .length > 0
  )
}

const hasExpiredMembership = (keys: Array<any>) => {
  const now = new Date().getTime() / 1000
  return !!(
    Object.values(keys).filter(
      ({ expiration }) => expiration > 0 && expiration < now
    ).length > 0
  )
}

export const Checkout = ({
  oAuthConfig,
  redirectUri,
  paywallConfig,
  emitCloseModal,
  emitTransactionInfo,
  emitUserInfo,
  web3Provider, // provider passed from the website which implements the paywall so we can support any wallet!
  defaultState,
}: CheckoutProps) => {
  const { account, isUnlockAccount, signMessage } = useContext(
    AuthenticationContext
  )
  const [skipPaywallIcon, setSkipPaywallIcon] = useState(false)
  const config = useContext(ConfigContext)
  const [state, setState] = useState('loading')
  const [showBack, setShowBack] = useState(false)
  const [cardDetails, setCardDetails] = useState<any>(null)
  const [signedMessage, setSignedMessage] = useState<string>('')
  const [existingKeys, setHasKey] = useReducer(keysReducer, {})
  const [selectedLock, selectLock] = useState<any>(null)
  const [savedMetadata, setSavedMetadata] = useState<any>(false)
  const [storedLoginEmail, setStoredLoginEmail] = useState<string>('')
  const { getAutoLoginEmail } = useAutoLogin()
  const storedEmail = getAutoLoginEmail()

  // state change
  useEffect(() => {
    setState(defaultState)
  }, [defaultState])

  const showLoginForm = () => {
    if (storedEmail.length > 0) {
      setStoredLoginEmail(storedEmail)
      setCheckoutState('login')
    } else {
      setCheckoutState('pick-lock')
    }
  }

  // When the account is changed, make sure we ping!
  useEffect(() => {
    const handleUser = async (account?: string) => {
      if (account) {
        let signedMessage
        if (paywallConfig?.messageToSign) {
          signedMessage = await signMessage(paywallConfig?.messageToSign)
          setSignedMessage(signedMessage)
        }
        setHasKey(-1)
        emitUserInfo({
          address: account,
          signedMessage,
        })
      }

      if (!account) {
        // Reset card details if user disconnected.
        setCardDetails(null)
      }

      if (selectedLock) {
        if (!isUnlockAccount) {
          // Check if we have card details.
          const checkoutState = cardDetails
            ? 'confirm-card-purchase'
            : 'crypto-checkout'
          setCheckoutState(checkoutState)
        } else {
          cardCheckoutOrClaim(selectedLock)
        }
      } else {
        setCheckoutState(defaultState)
        if (!account && storedEmail) showLoginForm()
      }
    }
    handleUser(account)
  }, [account])

  const allowClose = !(!paywallConfig || paywallConfig?.persistentCheckout)

  const handleTransactionInfo = (info: any) => {
    emitTransactionInfo(info)
  }

  const setCheckoutState = (state: string) => {
    if (
      !state ||
      state === 'connect' ||
      state === 'loading' ||
      state === 'config-error'
    ) {
      setShowBack(false)
    } else {
      setShowBack(true)
    }
    setState(state)
  }
  const web3Service = new Web3Service(config.networks)

  let content
  let paywallCta = 'default'
  if (hasPendingMembership(existingKeys)) {
    paywallCta = 'pending'
  } else if (hasValidMembership(existingKeys)) {
    paywallCta = 'confirmed'
  } else if (hasExpiredMembership(existingKeys)) {
    paywallCta = 'expired'
  }

  const closeModal = (
    success: boolean,
    redirectUri?: string,
    queryParams?: any
  ) => {
    emitCloseModal(success)
    if (redirectUri) {
      const redirectUrl = new URL(redirectUri)
      if (!success) {
        redirectUrl.searchParams.append('error', 'access-denied')
      }
      // append the signature
      if (signedMessage) {
        redirectUrl.searchParams.append('signature', signedMessage)
      }
      if (queryParams) {
        for (const key in queryParams) {
          if (queryParams[key] !== undefined && queryParams[key] !== null) {
            redirectUrl.searchParams.append(key, queryParams[key])
          }
        }
      }
      window.location.href = redirectUrl.toString()
    } else {
      // This will only work if the tab is the "main" tab.
      window.close()
    }
  }

  const cardCheckoutOrClaim = (lock: any) => {
    if (lock.keyPrice === '0' && lock.fiatPricing?.creditCardEnabled) {
      setCheckoutState('claim-membership')
    } else if (cardDetails) {
      setCheckoutState('confirm-card-purchase')
    } else {
      setCheckoutState('card-purchase')
    }
  }

  const onSelected = (lock: any) => {
    // Here we should set the state based on the account
    selectLock(lock)
    setSavedMetadata(null) // Do not keep track of saved metadata!
    if (!account) {
      setCheckoutState('pick-method')
    } else if (account && !isUnlockAccount) {
      setCheckoutState('crypto-checkout')
    } else {
      cardCheckoutOrClaim(lock)
    }
  }

  const lockProps = selectedLock && paywallConfig?.locks[selectedLock.address]
  if (state === 'login') {
    content = (
      <LogIn
        network={1} // We don't actually need a network here really.
        useWallet={() => setCheckoutState('wallet-picker')}
        storedLoginEmail={storedLoginEmail}
      />
    )
  } else if (state === 'wallet-picker') {
    content = (
      <LoginPrompt
        embedded
        showTitle={false}
        unlockUserAccount={false}
        injectedProvider={web3Provider}
        backgroundColor="var(--white)"
        activeColor="var(--offwhite)"
      >
        <p>Select your crypto wallet of choice.</p>
      </LoginPrompt>
    )
  } else if (state === 'crypto-checkout') {
    // Final step for the crypto checkout. We should save the metadata first!
    if (!paywallConfig) {
      content = <p>Missing paywall configuration. Please refresh this page</p>
    } else if (paywallConfig?.metadataInputs && !savedMetadata) {
      content = (
        <MetadataForm
          network={lockProps?.network || paywallConfig?.network}
          lock={selectedLock}
          fields={paywallConfig!.metadataInputs!}
          onSubmit={setSavedMetadata}
        />
      )
    } else {
      content = (
        <CryptoCheckout
          paywallConfig={paywallConfig}
          redirectUri={redirectUri}
          emitTransactionInfo={handleTransactionInfo}
          network={lockProps?.network || paywallConfig?.network}
          name={lockProps?.name || ''}
          lock={selectedLock}
          closeModal={closeModal}
          setCardPurchase={() => cardCheckoutOrClaim(selectedLock)}
        />
      )
    }
  } else if (state === 'card-purchase') {
    content = (
      <CardCheckout
        handleCard={(card, token) => {
          setCardDetails({ card, token })
          setCheckoutState('confirm-card-purchase')
        }}
        network={lockProps?.network || paywallConfig?.network}
      />
    )
  } else if (state === 'claim-membership') {
    if (paywallConfig?.metadataInputs && !savedMetadata) {
      content = (
        <MetadataForm
          network={lockProps?.network || paywallConfig?.network}
          lock={selectedLock}
          fields={paywallConfig!.metadataInputs!}
          onSubmit={setSavedMetadata}
        />
      )
    } else {
      content = (
        <ClaimMembershipCheckout
          paywallConfig={paywallConfig}
          redirectUri={redirectUri}
          emitTransactionInfo={handleTransactionInfo}
          lock={selectedLock}
          network={lockProps?.network || paywallConfig?.network}
          name={lockProps?.name || ''}
          closeModal={closeModal}
          {...cardDetails}
        />
      )
    }
  } else if (state === 'confirm-card-purchase') {
    if (paywallConfig?.metadataInputs && !savedMetadata) {
      content = (
        <MetadataForm
          network={lockProps?.network || paywallConfig?.network}
          lock={selectedLock}
          fields={paywallConfig!.metadataInputs!}
          onSubmit={setSavedMetadata}
        />
      )
    } else {
      content = (
        <CardConfirmationCheckout
          paywallConfig={paywallConfig}
          redirectUri={redirectUri}
          emitTransactionInfo={handleTransactionInfo}
          lock={selectedLock}
          network={lockProps?.network || paywallConfig?.network}
          name={lockProps?.name || ''}
          closeModal={closeModal}
          {...cardDetails}
        />
      )
    }
  } else if (state === 'new-account-with-card') {
    content = (
      <NewAccountCheckout
        askForCard
        showLogin={() => setCheckoutState('login')}
        network={lockProps?.network || paywallConfig?.network}
        onAccountCreated={async ({ card, token }) => {
          setCardDetails({ card, token })
          setCheckoutState('confirm-card-purchase')
        }}
      />
    )
  } else if (state === 'new-account') {
    content = (
      <NewAccountCheckout
        askForCard={false}
        showLogin={() => setCheckoutState('login')}
        network={lockProps?.network || paywallConfig?.network}
        onAccountCreated={async () => {
          setCheckoutState('claim-membership')
        }}
      />
    )
  } else if (state === 'pick-method') {
    content = (
      <CheckoutMethod
        showLogin={() => setCheckoutState('login')}
        lock={selectedLock}
        onWalletSelected={() => setCheckoutState('wallet-picker')}
        onNewAccountWithCardSelected={() =>
          setCheckoutState('new-account-with-card')
        }
        onNewAccountSelected={() => setCheckoutState('new-account')}
      />
    )
  } else if (state === 'pick-lock') {
    content = (
      <>
        <CallToAction
          state={paywallCta}
          callToAction={paywallConfig?.callToAction}
        />
        <Locks
          network={paywallConfig?.network}
          locks={paywallConfig?.locks ?? {}}
          setHasKey={setHasKey}
          onSelected={onSelected}
        />

        {!account && (
          <Prompt>
            Already a member? Access with your
            <br />{' '}
            <button type="button" onClick={() => setCheckoutState('login')}>
              unlock account
            </button>{' '}
            or your{' '}
            <button
              type="button"
              onClick={() => setCheckoutState('wallet-picker')}
            >
              crypto wallet
            </button>
            .
          </Prompt>
        )}

        {hasValidMembership(existingKeys) && (
          <EnjoyYourMembership
            redirectUri={redirectUri}
            closeModal={closeModal}
          />
        )}
      </>
    )
  } else if (state === 'connect') {
    if (!oAuthConfig || !redirectUri) {
      content = (
        <p>Your URL is missing the OAuth config or the redirect url. </p>
      )
    } else {
      content = (
        <OAuthConnect
          message={paywallConfig?.messageToSign}
          redirectUri={redirectUri}
          closeModal={closeModal}
          oAuthConfig={oAuthConfig}
        />
      )
    }
  } else if (state === 'loading') {
    content = <Loading />
  } else if (state === 'config-error') {
    content = (
      <p>
        There is a configuration error in your purchase URL. Please make sure it
        is configured correctly.
      </p>
    )
  }

  const onLoggedOut = () => {
    setHasKey(-1) // Resets keys
    emitUserInfo({})
    setCheckoutState(defaultState)
    selectLock(null)
    setShowBack(false)
  }

  const back = () => {
    setCheckoutState(defaultState)
    selectLock(null)
    setShowBack(false)
  }

  return (
    <Web3ServiceContext.Provider value={web3Service}>
      <CheckoutContainer>
        <CheckoutWrapper
          showBack={showBack}
          back={back}
          allowClose={allowClose}
          hideCheckout={() => closeModal(false, redirectUri)}
          onLoggedOut={onLoggedOut}
        >
          <PaywallLogoWrapper>
            {paywallConfig?.icon && !skipPaywallIcon ? (
              <PublisherLogo
                alt="Publisher Icon"
                src={paywallConfig?.icon}
                onError={() => setSkipPaywallIcon(true)}
              />
            ) : (
              <RoundedLogo size="56px" />
            )}
          </PaywallLogoWrapper>
          <Head>
            <title>{pageTitle('Checkout')}</title>
          </Head>
          {content}
        </CheckoutWrapper>
      </CheckoutContainer>
    </Web3ServiceContext.Provider>
  )
}

Checkout.defaultProps = {
  redirectUri: null,
  paywallConfig: null,
  oAuthConfig: null,
}

const PaywallLogoWrapper = styled.div`
  width: 100%;
  margin-bottom: 40px;

  > img {
    height: 50px;
    max-width: 200px;
  }
`
const Prompt = styled.p`
  width: 100%;
  font-size: 14px;
  color: var(--grey);
  button {
    border: none;
    outline: none;
    display: inline;
    padding: 0;
    background-color: transparent;
    color: var(--link);
    cursor: pointer;
  }
`

Checkout.defaultProps = {
  paywallConfig: {},
}

const PublisherLogo = styled.img``
