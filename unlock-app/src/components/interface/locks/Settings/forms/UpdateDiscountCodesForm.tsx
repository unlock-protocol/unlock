import { HookType } from '@unlock-protocol/types'

import { UpdateHooksForm } from './UpdateHooksForm'

interface UpdateDiscountCodesFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  version?: bigint
}

export const UpdateDiscountCodesForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  version,
}: UpdateDiscountCodesFormProps) => {
  return (
    <UpdateHooksForm
      lockAddress={lockAddress}
      network={network}
      isManager={isManager}
      disabled={disabled}
      version={version}
      fields={['keyPurchase']}
      includedHookTypes={{
        keyPurchase: [HookType.PROMO_CODE_CAPPED],
      }}
      showGeneralOptions={false}
    />
  )
}
