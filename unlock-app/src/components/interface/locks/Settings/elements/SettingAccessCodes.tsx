import { UpdateAccessCodesForm } from '../forms/UpdateAccessCodesForm'
import { SettingCard } from './SettingCard'

interface SettingAccessCodesProps {
  isLoading: boolean
  isManager: boolean
  isPaidLock: boolean
  lockAddress: string
  network: number
  publicLockVersion?: bigint
}

export const SettingAccessCodes = ({
  isLoading,
  isManager,
  isPaidLock,
  lockAddress,
  network,
  publicLockVersion,
}: SettingAccessCodesProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label={isPaidLock ? 'Discount codes' : 'Passwords'}
        description={
          isPaidLock
            ? 'Create checkout discount codes without going through advanced hook settings.'
            : 'Create password-based access codes for this free lock without going through advanced hook settings.'
        }
        isLoading={isLoading}
      >
        <UpdateAccessCodesForm
          disabled={!isManager}
          isPaidLock={isPaidLock}
          lockAddress={lockAddress}
          network={network}
          version={publicLockVersion}
        />
      </SettingCard>
    </div>
  )
}
