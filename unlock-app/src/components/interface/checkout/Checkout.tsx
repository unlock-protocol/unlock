import React, { useState, useContext, useReducer } from 'react'
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
import Buttons from '../buttons/lock'
import Loading from '../Loading'
import WalletPicker from './WalletPicker'
import CheckoutMethod from './CheckoutMethod'
import CryptoCheckout from './CryptoCheckout'
import CardCheckout from './CardCheckout'
import CardConfirmationCheckout from './CardConfirmationCheckout'
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
  emitCloseModal: () => void
  emitTransactionInfo: (info: TransactionInfo) => void
  emitUserInfo: (info: UserInfo) => void
  web3Provider: any
}

const keysReducer = (state: any, key: any) => {
  // Keeps track of all the keys, by lock
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
  const { authenticate, account, isUnlockAccount } = useContext(
    AuthenticationContext
  )
  const paywallConfig = useContext(PaywallConfigContext)
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

  const onProvider = async (provider: any) => {
    const { account } = await authenticate(provider)
    emitUserInfo({
      address: account,
    })
    if (selectedLock) {
      if (!provider.isUnlock) {
        setCheckoutState('crypto-checkout')
      } else {
        setCheckoutState('card-purchase')
      }
    } else {
      setCheckoutState('')
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

  const connectWallet = () => {
    setCheckoutState('wallet-picker')
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
      setCheckoutState('card-purchase')
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
      <WalletPicker
        injectedProvider={web3Provider}
        onProvider={(provider) => {
          if (selectedLock) {
            setCheckoutState('crypto-checkout')
          }
          onProvider(provider)
        }}
      />
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
          emitCloseModal={emitCloseModal}
          setCardPurchase={() => setCheckoutState('card-purchase')}
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
          emitCloseModal={emitCloseModal}
          {...cardDetails}
        />
      )
    }
  } else if (state === 'new-account') {
    content = (
      <NewAccountCheckout
        showLogin={() => setCheckoutState('login')}
        network={lockProps?.network || requiredNetwork}
        onAccountCreated={async (unlockProvider, { card, token }) => {
          setCardDetails({ card, token })
          await onProvider(unlockProvider)
          setCheckoutState('confirm-card-purchase')
        }}
      />
    )
  } else if (state === 'pick-method') {
    content = (
      <CheckoutMethod
        showLogin={() => setCheckoutState('login')}
        lock={selectedLock}
        onWalletSelected={() => setCheckoutState('wallet-picker')}
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
          <>
            <Prompt>Already a member? Access with your</Prompt>
            <CheckoutButtons>
              <Buttons.Account
                as="button"
                onClick={() => setCheckoutState('login')}
              />
              <Buttons.Wallet as="button" onClick={connectWallet} />
            </CheckoutButtons>
          </>
        )}

        {hasValidMembership(existingKeys) && (
          <EnjoyYourMembership emitCloseModal={emitCloseModal} />
        )}
      </>
    )
  }

  const back = () => {
    setCheckoutState('')
    selectLock(null)
    setShowBack(false)
  }

  return (
    <Web3ServiceContext.Provider value={web3Service}>
      <CheckoutContainer close={emitCloseModal}>
        <CheckoutWrapper
          showBack={showBack}
          back={back}
          allowClose={allowClose}
          hideCheckout={emitCloseModal}
        >
          <PaywallLogoWrapper>
            {paywallConfig.icon ? (
              <PublisherLogo alt="Publisher Icon" src={paywallConfig.icon} />
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

const CheckoutButtons = styled.div`
  width: 50%;
  display: flex;
  justify-content: space-around;
  small {
    display: inline-block;
  }
`

const Prompt = styled.p`
  font-size: 16px;
  color: var(--dimgrey);
`

const PublisherLogo = styled.img``
