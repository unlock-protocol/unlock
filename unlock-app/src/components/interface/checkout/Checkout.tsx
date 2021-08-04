import React, { useState, useContext, useReducer, useEffect } from 'react'
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

import {
  UserInfo,
  TransactionInfo,
} from '../../../hooks/useCheckoutCommunication'
import { PaywallConfigContext } from '../../../contexts/PaywallConfigContext'
import { AuthenticationContext } from '../Authenticate'

interface CheckoutProps {
  emitCloseModal: (success: boolean) => void
  emitTransactionInfo: (info: TransactionInfo) => void
  emitUserInfo: (info: UserInfo) => void
  web3Provider: any
}

const keysReducer = (state: any, key: any) => {
  // Keeps track of all the keys, by lock
  if (key === -1) {
    return {}
  }
  return {
    ...state,
    [key.lock]: key,
  }
}

const hasValidMembership = (keys: Array<any>) => {
  const now = new Date().getTime() / 1000
  return !!(
    Object.values(keys).filter(({ expiration }) => expiration > now).length > 0
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
  emitCloseModal,
  emitTransactionInfo,
  emitUserInfo,
  web3Provider, // provider passed from the website which implements the paywall so we can support any wallet!
}: CheckoutProps) => {
  const { authenticate, account, isUnlockAccount, signedMessage } = useContext(
    AuthenticationContext
  )
  const paywallConfig = useContext(PaywallConfigContext)
  const [paywallIcon, setPaywallIcon] = useState(paywallConfig?.icon)
  const config = useContext(ConfigContext)
  const [state, setState] = useState('')
  const [showBack, setShowBack] = useState(false)
  const [cardDetails, setCardDetails] = useState(null)
  const [existingKeys, setHasKey] = useReducer(keysReducer, {})
  const [selectedLock, selectLock] = useState<any>(null)
  const [savedMetadata, setSavedMetadata] = useState<any>(false)

  if (!paywallConfig || !config) {
    return <Loading />
  }

  const requiredNetwork = paywallConfig.network
  const allowClose = !(!paywallConfig || paywallConfig.persistentCheckout)
  const handleTransactionInfo = (info: any) => {
    emitTransactionInfo(info)
  }

  const setCheckoutState = (state: string) => {
    if (!state) {
      setShowBack(false)
    } else {
      setShowBack(true)
    }
    setState(state)
  }

  // When the account is changed, make sure we ping!
  useEffect(() => {
    if (account) {
      setHasKey(-1)
      emitUserInfo({
        address: account,
        signedMessage,
      })
    }
  }, [account])

  const onProvider = async (provider: any) => {
    const result = await authenticate(provider, paywallConfig.messageToSign)
    if (result) {
      if (selectedLock) {
        if (!provider.isUnlock) {
          setCheckoutState('crypto-checkout')
        } else {
          cardCheckoutOrClaim(selectedLock)
        }
      } else {
        setCheckoutState('')
      }
    }
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

  const closeModal = (success: boolean) => {
    emitCloseModal(success)
    if (paywallConfig.redirectUri) {
      window.location.href = paywallConfig.redirectUri
    }
  }

  const connectWallet = () => {
    setCheckoutState('wallet-picker')
  }

  const cardCheckoutOrClaim = (lock: any) => {
    if (lock.keyPrice === '0' && lock.fiatPricing.creditCardEnabled) {
      setCheckoutState('claim-membership')
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
  const lockProps = selectedLock && paywallConfig.locks[selectedLock.address]
  if (state === 'login') {
    content = (
      <LogIn
        network={1} // We don't actually need a network here really.
        embedded
        onProvider={onProvider}
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
        onProvider={(provider) => {
          if (selectedLock) {
            setCheckoutState('crypto-checkout')
          }
          onProvider(provider)
        }}
      >
        <p>Select your crypto wallet of choice.</p>
      </LoginPrompt>
    )
  } else if (state === 'crypto-checkout') {
    // Final step for the crypto checkout. We should save the metadata first!
    if (paywallConfig.metadataInputs && !savedMetadata) {
      content = (
        <MetadataForm
          network={lockProps?.network || requiredNetwork}
          lock={selectedLock}
          fields={paywallConfig!.metadataInputs!}
          onSubmit={setSavedMetadata}
        />
      )
    } else {
      content = (
        <CryptoCheckout
          paywallConfig={paywallConfig}
          emitTransactionInfo={handleTransactionInfo}
          network={lockProps?.network || requiredNetwork}
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
        network={lockProps?.network || requiredNetwork}
      />
    )
  } else if (state === 'claim-membership') {
    if (paywallConfig.metadataInputs && !savedMetadata) {
      content = (
        <MetadataForm
          network={lockProps?.network || requiredNetwork}
          lock={selectedLock}
          fields={paywallConfig!.metadataInputs!}
          onSubmit={setSavedMetadata}
        />
      )
    } else {
      content = (
        <ClaimMembershipCheckout
          emitTransactionInfo={handleTransactionInfo}
          lock={selectedLock}
          network={lockProps?.network || requiredNetwork}
          name={lockProps?.name || ''}
          closeModal={closeModal}
          {...cardDetails}
        />
      )
    }
  } else if (state === 'confirm-card-purchase') {
    if (paywallConfig.metadataInputs && !savedMetadata) {
      content = (
        <MetadataForm
          network={lockProps?.network || requiredNetwork}
          lock={selectedLock}
          fields={paywallConfig!.metadataInputs!}
          onSubmit={setSavedMetadata}
        />
      )
    } else {
      content = (
        <CardConfirmationCheckout
          emitTransactionInfo={handleTransactionInfo}
          lock={selectedLock}
          network={lockProps?.network || requiredNetwork}
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
        network={lockProps?.network || requiredNetwork}
        onAccountCreated={async (unlockProvider, { card, token }) => {
          setCardDetails({ card, token })
          await onProvider(unlockProvider)
          setCheckoutState('confirm-card-purchase')
        }}
      />
    )
  } else if (state === 'new-account') {
    content = (
      <NewAccountCheckout
        askForCard={false}
        showLogin={() => setCheckoutState('login')}
        network={lockProps?.network || requiredNetwork}
        onAccountCreated={async (unlockProvider) => {
          await onProvider(unlockProvider)
          setCheckoutState('confirm-claim')
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
  } else {
    content = (
      <>
        <CallToAction
          state={paywallCta}
          callToAction={paywallConfig.callToAction}
        />
        <Locks
          network={requiredNetwork}
          locks={paywallConfig.locks}
          setHasKey={setHasKey}
          onSelected={onSelected}
        />

        {!account && (
          <Prompt>
            Already a member? Access with your
            <br />{' '}
            <button type="button" onClick={() => setCheckoutState('login')}>
              unlock acount
            </button>{' '}
            or your{' '}
            <button type="button" onClick={connectWallet}>
              crypto wallet
            </button>
            .
          </Prompt>
        )}

        {hasValidMembership(existingKeys) && (
          <EnjoyYourMembership closeModal={closeModal} />
        )}
      </>
    )
  }

  const onLoggedOut = () => {
    setHasKey(-1) // Resets keys
    emitUserInfo({})
    setCheckoutState('')
    selectLock(null)
    setShowBack(false)
  }

  const back = () => {
    setCheckoutState('')
    selectLock(null)
    setShowBack(false)
  }

  return (
    <Web3ServiceContext.Provider value={web3Service}>
      <CheckoutContainer close={() => closeModal(false)}>
        <CheckoutWrapper
          showBack={showBack}
          back={back}
          allowClose={allowClose}
          hideCheckout={closeModal}
          onLoggedOut={onLoggedOut}
        >
          <PaywallLogoWrapper>
            {paywallIcon ? (
              <PublisherLogo
                alt="Publisher Icon"
                src={paywallIcon}
                onError={() => setPaywallIcon('')}
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

const PublisherLogo = styled.img``
