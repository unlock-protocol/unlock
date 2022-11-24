import { Lock } from '~/unlockTypes'
import { CreditCardForm } from '../forms/CreditCardForm'
import { SubscriptionForm } from '../forms/SubscriptionForm'
import { UpdatePriceForm } from '../forms/UpdatePriceForm'
import { SettingCard } from './SettingCard'

interface SettingPaymentsProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  lock?: Lock
}

export const SettingPayments = ({
  lockAddress,
  network,
  isManager,
  isLoading,
  lock,
}: SettingPaymentsProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Price"
        description="The price that the membership contract is charging for one membership."
        isLoading={isLoading}
      >
        <UpdatePriceForm
          lockAddress={lockAddress}
          network={network}
          price={parseInt(lock?.keyPrice ?? '0', 10) ?? 0}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label="Credit Card Payment"
        description="Accept credit cards, Apple Pay and Google Pay. Service & Credit card processing fees will be applied to the price paid by the member."
        isLoading={isLoading}
      >
        <CreditCardForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label="Renewals"
        description="Automatically renew memberships when they expire."
        isLoading={isLoading}
      >
        <SubscriptionForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
          lock={lock}
        />
      </SettingCard>
    </div>
  )
}
