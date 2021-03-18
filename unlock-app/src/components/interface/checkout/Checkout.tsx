import React, { useState, useContext } from 'react'
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
import { WrongNetwork } from '../../creator/FatalError'

interface CheckoutProps {
  emitCloseModal: () => void
  emitTransactionInfo: (info: TransactionInfo) => void
  emitUserInfo: (info: UserInfo) => void
  web3Provider: any
}

export const Checkout = ({
  emitCloseModal,
  emitTransactionInfo,
  emitUserInfo,
  web3Provider, // provider passed from the website which implements the paywall so we can support any wallet!
}: CheckoutProps) => {
  const { authenticate, account, network } = useContext(AuthenticationContext)

  const paywallConfig = useContext(PaywallConfigContext)
  const config = useContext(ConfigContext)
  const [loginShown, showLogin] = useState(false)
  const [activePayment, setActivePayment] = useState<string>('Default')
  const [fiatAvailable, setFiatAvailable] = useState(false)
  const [hasMembership, setHasMembership] = useState(false)
  const [focus, setFocus] = useState('')

  if (!paywallConfig || !config) {
    return <Loading />
  }

  const requiredNetwork = paywallConfig.network
  const networkConfig = config.networks[requiredNetwork]
  const allowClose = !(!paywallConfig || paywallConfig.persistentCheckout)
  const lockAddresses = paywallConfig ? Object.keys(paywallConfig.locks) : []

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

  const web3Service = new Web3Service(networkConfig)

  const showPaymentOptions = !focus && account && fiatAvailable

  let content

  if (!loginShown) {
    content = (
      <>
        <PaywallLogoWrapper>
          {paywallConfig.icon ? (
            <img alt="Publisher Icon" src={paywallConfig.icon} />
          ) : (
            <RoundedLogo size="56px" />
          )}
        </PaywallLogoWrapper>

        {!focus && (
          <CallToAction
            state="default"
            callToAction={paywallConfig.callToAction}
          />
        )}
        <Locks
          handleFiatAvailable={handleFiatAvailable}
          network={requiredNetwork}
          setFocus={setFocus}
          focus={focus}
          lockAddresses={lockAddresses}
          activePayment={activePayment}
          emitTransactionInfo={handleTransactionInfo}
          setHasMembership={setHasMembership}
        />
        {showPaymentOptions && (
          <SwitchPayment
            setActivePayment={changeActivePayment}
            activePayment={activePayment}
            paymentOptions={['Credit Card']}
          />
        )}
        {!showPaymentOptions && <Spacer />}
        {!account && (
          <AuthenticateButton
            web3Provider={web3Provider}
            showAccount={fiatAvailable}
            onProvider={onProvider}
            login={showLogin}
          />
        )}
        {hasMembership && (
          <p>
            Thank you for your trust.{' '}
            <button type="button" onClick={emitCloseModal}>
              Close
            </button>
            .
          </p>
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

  // != on purpose to stay flexible
  if (network && network != requiredNetwork) {
    content = <WrongNetwork network={requiredNetwork} />
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
  max-height: 100px;
  max-width: 200px;
  margin-bottom: 20px;
`

const Spacer = styled.div`
  height: 25px;
`
