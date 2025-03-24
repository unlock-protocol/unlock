import { useRemovePaymentMethods } from '~/hooks/usePaymentMethods'
import { usePaymentMethodList } from '~/hooks/usePaymentMethods'
import { loadStripe } from '@stripe/stripe-js'
import { useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { Button, Placeholder } from '@unlock-protocol/ui'
import { SetupForm } from '~/components/interface/checkout/main/CardPayment'
import { Card } from '~/components/interface/checkout/Card'
import { SettingCard } from '../locks/Settings/elements/SettingCard'

export const PaymentSettings = () => {
  const config = useConfig()
  const stripe = loadStripe(config.stripeApiKey, {})
  const [isSaving, setIsSaving] = useState(false)
  const { mutateAsync: removePaymentMethods } = useRemovePaymentMethods()
  const {
    data: methods,
    isLoading: isMethodLoading,
    refetch: refetchPaymentMethodList,
  } = usePaymentMethodList()

  const payment = methods?.[0]
  const card = payment?.card

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
    <div className="space-y-5">
      <SettingCard
        label="Card Payments"
        description="Some membership contracts may have fiat payment enabled. If you enter your payment details you will be able to use perform a fiat payment."
      >
        {isMethodLoading ? <Placeholder.Card size="md" /> : cardContent}
      </SettingCard>
    </div>
  )
}
