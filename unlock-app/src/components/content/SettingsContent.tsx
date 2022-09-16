import React from 'react'
import { useState } from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import AccountInfo from '../interface/user-account/AccountInfo'
import EjectAccount from '../interface/user-account/EjectAccount'
import { useAuth } from '../../contexts/AuthenticationContext'
import LoginPrompt from '../interface/LoginPrompt'
import { loadStripe } from '@stripe/stripe-js'
import { useConfig } from '~/utils/withConfig'
import { useQuery } from 'react-query'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { Card } from '../interface/checkout/alpha/Card'
import { deleteCardForAddress } from '~/hooks/useCards'
import { Setup } from '../interface/checkout/alpha/Checkout/CardPayment'
import { Button } from '@unlock-protocol/ui'

export const PaymentSettings = () => {
  const { account, network } = useAuth()
  const config = useConfig()
  const stripe = loadStripe(config.stripeApiKey, {})
  const storageService = useStorageService()
  const walletService = useWalletService()
  const [isSaving, setIsSaving] = useState(false)
  const {
    data: methods,
    isLoading: isMethodLoading,
    refetch,
  } = useQuery(
    ['list-cards', account],
    async () => {
      await storageService.loginPrompt({
        walletService,
        address: account!,
        chainId: network!,
      })
      return storageService.listCardMethods()
    },
    {
      enabled: !!account,
    }
  )

  const card = methods?.[0]?.card

  if (isMethodLoading) {
    return null
  }

  return card ? (
    <Card
      {...card}
      onChange={async () => {
        await deleteCardForAddress(config, walletService, account!)
        await refetch()
      }}
    />
  ) : (
    <div className="grid max-w-sm space-y-6">
      <Setup
        stripe={stripe}
        onSubmit={() => {
          setIsSaving(true)
        }}
        onSubmitted={async () => {
          await refetch()
          setIsSaving(false)
        }}
      />
      <Button
        loading={isSaving}
        disabled={isSaving}
        type="submit"
        form="payment"
      >
        Save
      </Button>
    </div>
  )
}

export const SettingsContent = () => {
  const { account } = useAuth()

  return (
    <Layout title="Account Settings">
      <Head>
        <title>{pageTitle('Account Settings')}</title>
      </Head>
      {!account && <LoginPrompt unlockUserAccount />}
      {account && (
        <>
          <AccountInfo />
          <PaymentSettings />
          <EjectAccount />
        </>
      )}
    </Layout>
  )
}

export default SettingsContent
