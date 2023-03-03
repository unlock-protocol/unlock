import { Input } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { ChangeEvent, useEffect, useState } from 'react'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { ConnectForm } from '../../../CheckoutUrl/elements/DynamicForm'
import { CustomComponentProps } from '../UpdateHooksForm'

export const PasswordContractHook = ({
  name,
  disabled,
  selectedOption,
}: CustomComponentProps) => {
  const [hookAddress, setHookAddress] = useState('')
  const [hookValue, setHookValue] = useState('')
  const [signer, setSigner] = useState('')

  useEffect(() => {
    if (hookValue.length === 0) return
    const encoded = ethers.utils.defaultAbiCoder.encode(
      ['bytes32'],
      [ethers.utils.id(hookValue)]
    )
    const privateKey = ethers.utils.keccak256(encoded)
    const privateKeyAccount = new ethers.Wallet(privateKey)
    setSigner(privateKeyAccount.address)
  }, [hookValue])

  return (
    <ConnectForm>
      {({ register, getValues, formState: { dirtyFields } }: any) => {
        const value = getValues(name)

        const isFieldDirty = dirtyFields[name]

        const showInput =
          (value?.length > 0 && value !== DEFAULT_USER_ACCOUNT_ADDRESS) ||
          (selectedOption ?? '')?.length > 0 ||
          isFieldDirty

        return (
          showInput && (
            <>
              <Input
                value={hookAddress}
                label="Contract address"
                {...register(name, {
                  validate: ethers.utils.isAddress,
                })}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setHookAddress(e?.target?.value)
                }
                disabled={disabled}
              />
              {hookAddress !== DEFAULT_USER_ACCOUNT_ADDRESS && (
                <Input
                  label="Password"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setHookValue(e?.target?.value)
                  }
                  description={
                    hookValue && (
                      <>
                        <span>The signer corresponding to hook is </span>
                        <span className="font-semibold text-brand-ui-primary">
                          {signer}
                        </span>
                      </>
                    )
                  }
                  disabled={disabled}
                />
              )}
            </>
          )
        )
      }}
    </ConnectForm>
  )
}
