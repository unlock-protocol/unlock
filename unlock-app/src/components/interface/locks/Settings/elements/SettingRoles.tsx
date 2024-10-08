import { KeyGranterForm } from '../forms/KeyGranterForm'
import { LockManagerForm } from '../forms/LockManagerForm'
import { SettingCard } from './SettingCard'

interface SettingRolesProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
}

export const SettingRoles = ({
  lockAddress,
  network,
  isManager,
  isLoading,
}: SettingRolesProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Lock Manager"
        description="By default, the creator of a Lock is the first Lock Manager, granting them the highest level of permissions for the lock. You can also assign this role to other wallets. Be careful: this role can’t be revoked, but only renounced."
        isLoading={isLoading}
      >
        <LockManagerForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>
      <SettingCard
        label="Key Granter"
        description="By default, any lock manager can grant keys, but you can also assign the key granter role to specific addresses and they can only grant (or extend) keys."
        isLoading={isLoading}
      >
        <KeyGranterForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>
    </div>
  )
}
