import React from 'react'
import { useState } from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import AccountInfo from '../interface/user-account/AccountInfo'
import EjectAccount from '../interface/user-account/EjectAccount'
import { useAuth } from '../../contexts/AuthenticationContext'
import { loadStripe } from '@stripe/stripe-js'
import { useConfig } from '~/utils/withConfig'
import { useQuery } from '@tanstack/react-query'
import { useWalletService } from '~/utils/withWalletService'
import { Card } from '../interface/checkout/Card'
import { deleteCardForAddress } from '~/hooks/useCards'
import { SetupForm } from '../interface/checkout/main/CardPayment'
import { Button } from '@unlock-protocol/ui'
import { AppLayout } from '../interface/layouts/AppLayout'
import { storage } from '~/config/storage'

export const PaymentSettings = () => {
  const { account } = useAuth()
  const config = useConfig()
  const stripe = loadStripe(config.stripeApiKey, {})
  const walletService = useWalletService()
  const [isSaving, setIsSaving] = useState(false)
  const {
    data: methods,
    isInitialLoading: isMethodLoading,
    refetch,
  } = useQuery(
    ['listCards', account],
    async () => {
      const response = await storage.listPaymentMethods()
      return response.data.methods || []
    },
    {
      enabled: !!account,
    }
  )

  const payment = methods?.[0]
  const card = payment?.card

  if (isMethodLoading) {
    return null
  }

  return card ? (
    <Card
      name={payment!.billing_details?.name || ''}
      last4={card.last4!}
      exp_month={card.exp_month!}
      exp_year={card.exp_year!}
      country={card.country!}
      onChange={async () => {
        await deleteCardForAddress(config, walletService, account!)
        await refetch()
      }}
    />
  ) : (
    <div className="grid max-w-sm space-y-6">
      <SetupForm
        stripe={stripe}
        onSubmit={() => {
          setIsSaving(true)
        }}
        onSuccess={async () => {
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
  return (
    <AppLayout title="Account Settings">
      <Head>
        <title>{pageTitle('Account Settings')}</title>
      </Head>
      <AccountInfo />
      <PaymentSettings />
      <EjectAccount />
    </AppLayout>
  )
}

export default SettingsContent
