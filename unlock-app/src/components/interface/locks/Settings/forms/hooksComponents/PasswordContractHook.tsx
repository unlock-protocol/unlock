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
import { ToastHelper } from '~/components/helpers/toast.helper'

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
  const [hasSigner] = useState(false)

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

  const savePasswordMutation = useMutation(onSavePassword)

  const handleSavePassword = async () => {
    const promise = savePasswordMutation.mutateAsync()

    await ToastHelper.promise(promise, {
      loading: 'Updating password...',
      success: 'Password is set for the lock.',
      error: 'There is an issue with password update.',
    })
  }

  return (
    <ConnectForm>
      {({ getValues, formState: { dirtyFields }, setValue }: any) => {
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
                  hasSigner && (
                    <span>
                      Password already set, set and save a new one to update.{' '}
                    </span>
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
                  onClick={async () => {
                    await handleSavePassword()
                    setValue(name, value)
                  }}
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
