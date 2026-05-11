import { UpdateDiscountCodesForm } from '../forms/UpdateDiscountCodesForm'
import { SettingCard } from './SettingCard'

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
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Discount Codes"
        description="Create discount codes for this paid lock without opening the advanced hooks settings."
        isLoading={isLoading || publicLockVersion === undefined}
        defaultOpen
      >
        <UpdateDiscountCodesForm
          lockAddress={lockAddress}
          network={network}
          disabled={!isManager}
          version={publicLockVersion}
        />
      </SettingCard>
    </div>
  )
}
