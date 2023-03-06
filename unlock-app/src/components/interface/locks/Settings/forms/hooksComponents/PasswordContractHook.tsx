import networks from '@unlock-protocol/networks'
import { Button, Input } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { ChangeEvent, useEffect, useState } from 'react'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { ConnectForm } from '../../../CheckoutUrl/elements/DynamicForm'
import { CustomComponentProps } from '../UpdateHooksForm'
import { CustomHookService } from '@unlock-protocol/unlock-js'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMutation } from '@tanstack/react-query'

export const PasswordContractHook = ({
  name,
  disabled,
  selectedOption,
  lockAddress,
  network,
}: CustomComponentProps) => {
  const { getWalletService } = useAuth()
  const customContractHook = new CustomHookService(networks)
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

  const onSavePassword = async () => {
    const walletService = await getWalletService(network)
    return customContractHook.setPasswordHookSigner(
      {
        lockAddress,
        signerAddress: signer,
        network,
      },
      walletService.signer
    )
  }

  const savePasswordMutation = useMutation(onSavePassword, {
    onSuccess: () => {
      // todo: save hooks value
    },
  })

  return (
    <ConnectForm>
      {({ getValues, formState: { dirtyFields } }: any) => {
        const value = getValues(name)

        const isFieldDirty = dirtyFields[name]

        const showInput =
          (value?.length > 0 && value !== DEFAULT_USER_ACCOUNT_ADDRESS) ||
          (selectedOption ?? '')?.length > 0 ||
          isFieldDirty

        return (
          showInput && (
            <div className="flex flex-col gap-2">
              <Input
                label="Password"
                type="password"
                value={hookValue}
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
              <div className="ml-auto">
                <Button
                  type="button"
                  size="small"
                  disabled={savePasswordMutation.isLoading}
                  loading={savePasswordMutation.isLoading}
                  onClick={() => savePasswordMutation.mutateAsync()}
                >
                  Save password
                </Button>
              </div>
            </div>
          )
        )
      }}
    </ConnectForm>
  )
}
