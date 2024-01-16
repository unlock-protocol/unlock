import { Lock } from '~/unlockTypes'
import { CreditCardWithStripeForm } from '../forms/CreditCardWithStripeForm'
import { ReceiptBaseForm } from '../forms/ReceiptBaseForm'
import { SubscriptionForm } from '../forms/SubscriptionForm'
import { UpdatePriceForm } from '../forms/UpdatePriceForm'
import { SettingCard } from './SettingCard'
import { UpdateGasRefundForm } from '../forms/UpdateGasRefundForm'
import Link from 'next/link'

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
        description="The price that the lock contract is charging for one membership, whether it is a new one or a renewal."
        isLoading={isLoading}
      >
        <UpdatePriceForm
          lockAddress={lockAddress}
          network={network}
          price={parseFloat(lock?.keyPrice ?? '0')}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label="Credit Card Payment with Stripe"
        description="Accept credit cards, Apple Pay and Google Pay. Service & Credit card processing fees will be applied to the price paid by the member."
        isLoading={isLoading}
      >
        <CreditCardWithStripeForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label="Payments with Crossmint"
        description={
          <>
            Enabling payment with{' '}
            <Link
              href="https://www.crossmint.com/products/nft-checkout"
              target="_blank"
            >
              Crossmint
            </Link>{' '}
            will allow your members to pay with any ERC20 token. Crossmint will
            convert the ERC20 token to the currency of your choice and send it
            to your lock.
          </>
        }
        isLoading={isLoading}
      >
        <CreditCardWithStripeForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label="Gas Refunds"
        description="Set up a gas refund. This is required for renewals."
      >
        <UpdateGasRefundForm
          lockAddress={lockAddress}
          network={network}
          disabled={!isManager}
        />
      </SettingCard>
      <SettingCard
        label="Renewals"
        description="Automatically renew memberships when they expire. Users will need to have the previously approved the renewals, as well as have a sufficient amount of tokens in their wallets."
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

      <SettingCard
        label="Receipts"
        description="Update the supplier information to be shown on receipts."
        isLoading={isLoading}
      >
        <ReceiptBaseForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>
    </div>
  )
}
