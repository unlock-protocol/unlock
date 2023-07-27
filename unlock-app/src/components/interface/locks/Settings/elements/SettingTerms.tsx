import { ReactNode } from 'react'
import { Lock } from '~/unlockTypes'
import { CancellationForm } from '../forms/CancellationForm'
import { UpdateDurationForm } from '../forms/UpdateDurationForm'
import { UpdateMaxKeysPerAddress } from '../forms/UpdateMaxKeysPerAddress'
import { UpdateQuantityForm } from '../forms/UpdateQuantityForm'
import { UpdateTransferFee } from '../forms/UpdateTransferFee'
import { SettingCard } from './SettingCard'
import { UNLIMITED_KEYS_DURATION } from '~/constants'

interface SettingTermsProps {
  lockAddress: string
  network: number
  isManager: boolean
  lock: Lock
  isLoading: boolean
  publicLockVersion?: number
}

interface SettingProps {
  label: string
  description?: string
  children: ReactNode
  active?: boolean
}

export const SettingTerms = ({
  lockAddress,
  network,
  isManager,
  lock,
  isLoading,
  publicLockVersion,
}: SettingTermsProps) => {
  const unlimitedDuration = lock?.expirationDuration === UNLIMITED_KEYS_DURATION

  const settings: SettingProps[] = [
    {
      label: 'Transfers',
      description:
        'Make tokens non-transferable (soulbound) or apply fees on transfers.',
      children: (
        <UpdateTransferFee
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
          unlimitedDuration={unlimitedDuration}
        />
      ),
    },
    {
      label: 'Duration',
      description: 'Set up how long each membership lasts. ',
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
        'The maximum number of memberships that can be sold from your contract. Note: there is no limit to the number of memberships that can be airdropped by a lock manager or key granter.',
      children: (
        <UpdateQuantityForm
          lockAddress={lockAddress}
          maxNumberOfKeys={lock?.maxNumberOfKeys ?? 0}
          isManager={isManager}
          disabled={!isManager}
          network={network}
        />
      ),
    },
    {
      label: 'Maximum number of keys per address',
      description:
        'The maximum number of keys a specific address can own. By default, a given address can only own a single key.',
      children: (
        <UpdateMaxKeysPerAddress
          isManager={isManager}
          disabled={!isManager}
          maxKeysPerAddress={lock?.maxKeysPerAddress ?? 1}
          lockAddress={lockAddress}
          network={network}
          publicLockVersion={publicLockVersion}
        />
      ),
    },
    {
      label: 'Cancellation',
      description:
        'Select how your contract should handle cancellations and optionally issue refunds.',
      children: (
        <CancellationForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6">
      {settings?.map(
        ({ label, description, children, active = true }, index) => {
          if (!active) return null
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
        }
      )}
    </div>
  )
}
