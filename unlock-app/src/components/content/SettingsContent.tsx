import React, { ReactNode, useContext } from 'react'
import { useState } from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import EjectAccount from '../interface/user-account/EjectAccount'
import AuthenticationContext, {
  useAuth,
} from '../../contexts/AuthenticationContext'
import { loadStripe } from '@stripe/stripe-js'
import { useConfig } from '~/utils/withConfig'
import { useQuery } from '@tanstack/react-query'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { Card } from '../interface/checkout/alpha/Card'
import { deleteCardForAddress } from '~/hooks/useCards'
import { SetupForm } from '../interface/checkout/alpha/Checkout/CardPayment'
import { Button } from '@unlock-protocol/ui'
import { AppLayout } from '../interface/layouts/AppLayout'
import useEns from '~/hooks/useEns'

interface DetailProps {
  title: string
  value: ReactNode
}

const Detail = ({ title, value }: DetailProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-gray-500 uppercase">
        {title}
      </span>
      <span className="text-base">{value}</span>
    </div>
  )
}

const AccountInfo = () => {
  const { account, email } = useContext(AuthenticationContext)
  const name = useEns(account || '')

  return (
    <div className="flex flex-col gap-4">
      <span className="text-base font-semibold">Account</span>
      <div className="flex flex-col gap-4">
        {email && <Detail title="Email" value={email} />}
        <Detail title="Wallet Address" value={name} />
      </div>
    </div>
  )
}

export const PaymentSettings = () => {
  const { account, network } = useAuth()
  const config = useConfig()
  const stripe = loadStripe(config.stripeApiKey, {})
  const storageService = useStorageService()
  const walletService = useWalletService()
  const [isSaving, setIsSaving] = useState(false)
  const {
    data: methods,
    isInitialLoading: isMethodLoading,
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
      <div className="flex flex-col gap-2">
        <AccountInfo />
        <PaymentSettings />
        <EjectAccount />
      </div>
    </AppLayout>
  )
}

export default SettingsContent
