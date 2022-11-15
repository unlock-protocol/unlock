import { useQuery } from '@tanstack/react-query'
import { Lock } from '@unlock-protocol/types'
import { ReactNode } from 'react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { UpdateDurationForm } from '../forms/UpdateDurationForm'
import { UpdatePriceForm } from '../forms/UpdatePriceForm'
import { UpdateQuantityForm } from '../forms/UpdateQuantityForm'
import { SettingCard } from './SettingCard'

interface MembershipTermsProps {
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

export const MembershipTerms = ({
  lockAddress,
  network,
  isManager,
  lock,
  isLoading,
}: MembershipTermsProps) => {
  const settings: SettingProps[] = [
    {
      label: 'Duration',
      description: 'Set up how long each membership last.',
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
      description: 'The maximum number of memberships that can be sold. Note: There is no limit to the number of memberships that can be airdropped by a lock manager or key granter.',
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
      description: 'The price that you are charging for membership.',
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
      description:
        'Automatically renew memberships when they expire.',
      children: null,
    },
    {
      label: 'Credit Card Payment',
      description:
        'Accept credit cards & ACH payments. Service & Credit card processing fees will apply to your member.',
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
        'Select how you would process when member cancel the membership.',
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
