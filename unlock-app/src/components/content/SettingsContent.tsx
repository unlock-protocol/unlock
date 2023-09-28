import React from 'react'
import { useState } from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import AccountInfo from '../interface/user-account/AccountInfo'
import EjectAccount from '../interface/user-account/EjectAccount'
import { loadStripe } from '@stripe/stripe-js'
import { useConfig } from '~/utils/withConfig'
import { Card } from '../interface/checkout/Card'
import { SetupForm } from '../interface/checkout/main/CardPayment'
import { Button } from '@unlock-protocol/ui'
import { AppLayout } from '../interface/layouts/AppLayout'
import {
  usePaymentMethodList,
  useRemovePaymentMethods,
} from '~/hooks/usePaymentMethods'

export const PaymentSettings = () => {
  const config = useConfig()
  const stripe = loadStripe(config.stripeApiKey, {})
  const [isSaving, setIsSaving] = useState(false)
  const { mutateAsync: removePaymentMethods } = useRemovePaymentMethods()
  const {
    data: methods,
    isInitialLoading: isMethodLoading,
    refetch: refetchPaymentMethodList,
  } = usePaymentMethodList()

  const payment = methods?.[0]
  const card = payment?.card

  if (isMethodLoading) {
    return null
  }
  const cardContent = card ? (
    <Card
      name={payment!.billing_details?.name || ''}
      last4={card.last4!}
      exp_month={card.exp_month!}
      exp_year={card.exp_year!}
      country={card.country!}
      onChange={async () => {
        await removePaymentMethods()
        await refetchPaymentMethodList()
      }}
    />
  ) : (
    <div className="grid max-w-sm space-y-6">
      <SetupForm
        stripe={stripe}
        onSubmit={() => {
          setIsSaving(true)
        }}
        onError={() => {
          setIsSaving(false)
        }}
        onSuccess={async () => {
          await refetchPaymentMethodList()
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

  return (
    <div className="flex flex-col gap-4 mt-6 mb-4">
      <div className="col-span-12 text-base font-bold leading-5">
        Card Payments
      </div>
      <p>
        Some membership contracts may have fiat payment enabled. If you enter
        your payment details you will be able to use perform a fiat payment.
      </p>
      {cardContent}
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
