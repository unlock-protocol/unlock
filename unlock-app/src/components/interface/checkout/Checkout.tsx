import React, { useState, useContext, useReducer } from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { RoundedLogo } from '../Logo'

import { ConfigContext } from '../../../utils/withConfig'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'
import CheckoutWrapper from './CheckoutWrapper'
import CheckoutContainer from './CheckoutContainer'
import { Locks } from './Locks'
import { CallToAction } from './CallToAction'
import { SwitchPayment } from './SwitchPayment'
import Loading from '../Loading'
import { pageTitle } from '../../../constants'

import {
  UserInfo,
  TransactionInfo,
} from '../../../hooks/useCheckoutCommunication'
import { PaywallConfigContext } from '../../../contexts/PaywallConfigContext'
import AuthenticateButton from '../buttons/AuthenticateButton'
import { AuthenticationContext } from '../Authenticate'
import LogInSignUp from '../LogInSignUp'
import { ActionButton } from '../buttons/ActionButton'

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
  const { authenticate, account } = useContext(AuthenticationContext)

  const paywallConfig = useContext(PaywallConfigContext)
  const config = useContext(ConfigContext)
  const [loginShown, showLogin] = useState(false)
  const [activePayment, setActivePayment] = useState<string>('Default')
  const [fiatAvailable, setFiatAvailable] = useState(false)
  const [existingKeys, setHasKey] = useReducer(keysReducer, {})
  const [focus, setFocus] = useState('')

  if (!paywallConfig || !config) {
    return <Loading />
  }

  const requiredNetwork = paywallConfig.network
  const allowClose = !(!paywallConfig || paywallConfig.persistentCheckout)

  const changeActivePayment = (type: string) => {
    setActivePayment(type)
  }

  const handleTransactionInfo = (info: any) => {
    emitTransactionInfo(info)
  }

  const onProvider = (provider: any) => {
    authenticate(provider, (address: string) => {
      emitUserInfo({
        address,
      })
    })
    showLogin(false)
  }

  const handleFiatAvailable = () => {
    setFiatAvailable(true)
  }

  const web3Service = new Web3Service(config.networks)

  const showPaymentOptions = !focus && account && fiatAvailable

  let content
  let paywallCta = 'default'
  if (hasPendingMembership(existingKeys)) {
    paywallCta = 'pending'
  } else if (hasValidMembership(existingKeys)) {
    paywallCta = 'confirmed'
  } else if (hasExpiredMembership(existingKeys)) {
    paywallCta = 'expired'
  }

  if (!loginShown) {
    content = (
      <>
        <PaywallLogoWrapper>
          {paywallConfig.icon ? (
            <PublisherLogo alt="Publisher Icon" src={paywallConfig.icon} />
          ) : (
            <RoundedLogo size="56px" />
          )}
        </PaywallLogoWrapper>

        {!focus && (
          <CallToAction
            state={paywallCta}
            callToAction={paywallConfig.callToAction}
          />
        )}

        {!account && <Prompt>Select your authentication method</Prompt>}

        {account && !hasValidMembership(existingKeys) && (
          <Prompt>Ready to make payment</Prompt>
        )}

        {account && hasValidMembership(existingKeys) && (
          <Prompt>Thank you for your trust!</Prompt>
        )}

        {!account && (
          <AuthenticateButton
            web3Provider={web3Provider}
            showAccount={fiatAvailable}
            onProvider={onProvider}
            login={showLogin}
          />
        )}
        <Locks
          handleFiatAvailable={handleFiatAvailable}
          network={requiredNetwork}
          setFocus={setFocus}
          focus={focus}
          locks={paywallConfig.locks}
          activePayment={activePayment}
          emitTransactionInfo={handleTransactionInfo}
          setHasKey={setHasKey}
        />
        {showPaymentOptions && (
          <SwitchPayment
            setActivePayment={changeActivePayment}
            activePayment={activePayment}
            paymentOptions={['Credit Card']}
          />
        )}
        {hasValidMembership(existingKeys) && (
          <BackToSiteButton onClick={emitCloseModal}>
            Back to the site
          </BackToSiteButton>
        )}
      </>
    )
  }

  if (loginShown) {
    content = (
      <LogInSignUp
        network={requiredNetwork}
        embedded
        onCancel={() => showLogin(false)}
        login
        onProvider={onProvider}
      />
    )
  }

  return (
    <Web3ServiceContext.Provider value={web3Service}>
      <CheckoutContainer close={emitCloseModal}>
        <CheckoutWrapper allowClose={allowClose} hideCheckout={emitCloseModal}>
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

  > img {
    height: 50px;
    max-width: 200px;
  }
`

const Spacer = styled.div`
  height: 25px;
`

const Prompt = styled.p`
  font-size: 16px;
  font-weight: bold;
`

const PublisherLogo = styled.img``

const BackToSiteButton = styled(ActionButton).attrs({
  fontColor: 'var(--green)',
  color: 'none',
})`
  width: 240px;
  height: 48px;
`
