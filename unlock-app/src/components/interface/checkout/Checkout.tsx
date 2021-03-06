import React, { useState, useContext } from 'react'
import Head from 'next/head'
import styled from 'styled-components'

import { Web3Service } from '@unlock-protocol/unlock-js'
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
import Authenticate from '../Authenticate'
import ProviderContext from '../../../contexts/ProviderContext'

interface CheckoutProps {
  emitCloseModal: () => void
  emitTransactionInfo: (info: TransactionInfo) => void
  emitUserInfo: (info: UserInfo) => void
  providerAdapter: any
}

export const Checkout = ({
  emitCloseModal,
  emitTransactionInfo,
  emitUserInfo,
  providerAdapter, // provider passed from the website which implements the paywall so we can support any wallet!
}: CheckoutProps) => {
  const { provider } = useContext(ProviderContext)

  const paywallConfig = useContext(PaywallConfigContext)
  const config = useContext(ConfigContext)
  const [activePayment, setActivePayment] = useState<string>(
    !provider || provider.isUnlock ? 'Credit Card' : 'Default'
  )
  const [focus, setFocus] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [account, setAccount] = useState('')

  if (!paywallConfig || !config) {
    return <Loading />
  }

  const requiredNetwork = paywallConfig.network || '1'
  const networkConfig = config.networks[requiredNetwork] // Defaults to mainnet if network is missing from conf!
  const allowClose = !(!paywallConfig || paywallConfig.persistentCheckout)
  const lockAddresses = paywallConfig ? Object.keys(paywallConfig.locks) : []

  const changeActivePayment = (type: string) => {
    setAuthenticated(true)
    setActivePayment(type)
  }

  const handleTransactionInfo = (info: any) => {
    emitTransactionInfo(info)
  }

  const authenticate = () => {
    setAuthenticated(true)
  }

  const onAuthenticated = (address: string) => {
    if (account !== address) {
      setAccount(address)
      emitUserInfo({
        address,
      })
    }
  }

  const web3Service = new Web3Service(networkConfig)

  const showPaymentOptions =
    !focus && authenticated && provider && !provider.isUnlock

  const content = (
    <>
      {paywallConfig && paywallConfig.icon && (
        <PaywallLogo alt="Publisher Icon" src={paywallConfig.icon} />
      )}
      {!focus && (
        <CallToAction
          state="default"
          callToAction={paywallConfig.callToAction}
        />
      )}

      <Locks
        authenticate={authenticate}
        authenticated={authenticated}
        setFocus={setFocus}
        focus={focus}
        lockAddresses={lockAddresses}
        activePayment={activePayment}
        emitTransactionInfo={handleTransactionInfo}
      />
      {showPaymentOptions && (
        <SwitchPayment
          setActivePayment={changeActivePayment}
          activePayment={activePayment}
          paymentOptions={['Credit Card']}
        />
      )}
      {!showPaymentOptions && <Spacer />}
    </>
  )

  return (
    <Web3ServiceContext.Provider value={web3Service}>
      <CheckoutContainer close={emitCloseModal}>
        <CheckoutWrapper allowClose={allowClose} hideCheckout={emitCloseModal}>
          <Head>
            <title>{pageTitle('Checkout')}</title>
          </Head>

          {authenticated && (
            <Authenticate
              embedded
              onCancel={() => setAuthenticated(false)}
              requiredNetwork={requiredNetwork}
              unlockUserAccount
              onAuthenticated={onAuthenticated}
              providerAdapter={providerAdapter}
            >
              {content}
            </Authenticate>
          )}
          {!authenticated && <>{content}</>}
        </CheckoutWrapper>
      </CheckoutContainer>
    </Web3ServiceContext.Provider>
  )
}

const PaywallLogo = styled.img`
  height: 100px;
  max-width: 200px;
  align-self: start;
`

const Spacer = styled.div`
  height: 75px;
`
