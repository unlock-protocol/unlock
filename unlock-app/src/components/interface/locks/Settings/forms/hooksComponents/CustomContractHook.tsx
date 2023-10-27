import { Input } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { CustomComponentProps } from '../UpdateHooksForm'
import { ConnectForm } from '../../../CheckoutUrl/ChooseConfiguration'

export const CustomContractHook = ({
  name,
  disabled,
  selectedOption,
}: CustomComponentProps) => {
  return (
    <ConnectForm>
      {({ register, getValues, formState: { errors, dirtyFields } }: any) => {
        const hasError = errors?.[name] ?? false
        const value = getValues(name)
        const isFieldDirty = dirtyFields[name]

        const showInput =
          (value?.length > 0 && value !== DEFAULT_USER_ACCOUNT_ADDRESS) ||
          (selectedOption ?? '')?.length > 0 ||
          isFieldDirty

        return (
          showInput && (
            <Input
              label="Contract address"
              {...register(name, {
                validate: ethers.utils.isAddress,
              })}
              disabled={disabled}
              placeholder="Contract address, for ex: 0x00000000000000000"
              error={hasError && 'Enter a valid address'}
            />
          )
        )
      }}
    </ConnectForm>
  )
}
