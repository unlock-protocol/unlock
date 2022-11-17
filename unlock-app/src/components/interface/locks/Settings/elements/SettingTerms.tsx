import { Lock } from '@unlock-protocol/types'
import { ReactNode } from 'react'
import { UpdateDurationForm } from '../forms/UpdateDurationForm'
import { UpdatePriceForm } from '../forms/UpdatePriceForm'
import { UpdateQuantityForm } from '../forms/UpdateQuantityForm'
import { SettingCard } from './SettingCard'

interface SettingTermsProps {
  lockAddress: string
  network: string
  isManager: boolean
  lock: Lock
  isLoading: boolean
}

interface SettingProps {
  label: string
  description?: string
  children: ReactNode
}

export const SettingTerms = ({
  lockAddress,
  network,
  isManager,
  lock,
  isLoading,
}: SettingTermsProps) => {
  const settings: SettingProps[] = [
    {
      label: 'Duration',
      description: 'Set up how long each membership lasts.',
      children: (
        <UpdateDurationForm
          lockAddress={lockAddress}
          network={network}
          duration={lock?.expirationDuration}
          isManager={isManager}
          disabled={!isManager}
        />
      ),
    },
    {
      label: 'Quantity',
      description:
        'The maximum number of memberships that can be sold. Note: There is no limit to the number of memberships that can be airdropped by a lock manager or key granter.',
      children: (
        <UpdateQuantityForm
          lockAddress={lockAddress}
          network={network}
          maxNumberOfKeys={lock?.maxNumberOfKeys ?? 0}
          isManager={isManager}
          disabled={!isManager}
        />
      ),
    },
    {
      label: 'Price',
      description:
        'The price that the membership contract is charging for one membership.',
      children: (
        <UpdatePriceForm
          lockAddress={lockAddress}
          network={network}
          price={parseInt(lock?.keyPrice, 10) ?? 0}
          isManager={isManager}
          disabled={!isManager}
        />
      ),
    },
    {
      label: 'Subscription',
      description: 'Automatically renew memberships when they expire.',
      children: null,
    },
    {
      label: 'Credit Card Payment',
      description:
        'Accept credit cards, Apple Pay and Google Pay. Service & Credit card processing fees will be applied to the price paid by the member.',
      children: null,
    },
    {
      label: 'Transfer',
      description: 'Allow members to transfer membership from one to others.',
      children: null,
    },
    {
      label: 'Cancellation',
      description:
        'Select how your contract should handle cancellations and optionally issue refunds.',
      children: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6">
      {settings?.map(({ label, description, children }, index) => {
        return (
          <SettingCard
            key={index}
            label={label}
            description={description}
            isLoading={isLoading}
          >
            {children}
          </SettingCard>
        )
      })}
    </div>
  )
}
