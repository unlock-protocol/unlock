import { LockManagerForm } from '../forms/LockManagerForm'
import { VerifierForm } from '../forms/VerifierForm'
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
        label="Verifier"
        description="Best use for in person event. Verifiers are trusted users at an event who can use a smart phone camera to scan a ticket QR code at the check-in to a venue and mark a ticket as checked-in."
        isLoading={isLoading}
      >
        <VerifierForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>
    </div>
  )
}
