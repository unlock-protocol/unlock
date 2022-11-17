import { Lock } from '@unlock-protocol/types'
import { LockNameForm } from '../forms/LockNameForm'
import { SettingCard } from './SettingCard'

interface SettingGeneralProps {
  lockAddress: string
  isManager: boolean
  isLoading: boolean
  lock: Lock
}

export const SettingGeneral = ({
  isManager,
  lockAddress,
  isLoading,
  lock,
}: SettingGeneralProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Contract name"
        description="Customize the contract name on chain. "
        isLoading={isLoading}
      >
        <LockNameForm
          lockAddress={lockAddress}
          isManager={isManager}
          disabled={!isManager}
          lockName={lock?.name ?? ''}
        />
      </SettingCard>
    </div>
  )
}
