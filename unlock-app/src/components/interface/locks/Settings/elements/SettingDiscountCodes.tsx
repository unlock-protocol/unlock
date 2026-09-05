import { SettingCard } from './SettingCard'
import { UpdateDiscountCodesForm } from '../forms/UpdateDiscountCodesForm'

interface SettingDiscountCodesProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  publicLockVersion?: bigint
}

export const SettingDiscountCodes = ({
  lockAddress,
  network,
  isManager,
  isLoading,
  publicLockVersion,
}: SettingDiscountCodesProps) => {
  return (
    <SettingCard
      label="Discount codes"
      description="Create and manage discount codes for paid memberships."
      isLoading={isLoading}
    >
      <UpdateDiscountCodesForm
        lockAddress={lockAddress}
        network={network}
        isManager={isManager}
        disabled={!isManager}
        version={publicLockVersion}
      />
    </SettingCard>
  )
}
