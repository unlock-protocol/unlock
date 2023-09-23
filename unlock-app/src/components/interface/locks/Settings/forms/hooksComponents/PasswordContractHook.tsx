import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import { ChangeEvent, useEffect, useState } from 'react'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { CustomComponentProps } from '../UpdateHooksForm'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { getEthersWalletFromPassword } from '~/utils/strings'
import { ConnectForm } from '../../../CheckoutUrl/ChooseConfiguration'

const FAKE_PWD = 'fakepwd'
export const PasswordContractHook = ({
  name,
  disabled,
  selectedOption,
  lockAddress,
  network,
  hookAddress,
}: CustomComponentProps) => {
  const { getWalletService } = useAuth()
  const web3Service = useWeb3Service()
  const [hookValue, setHookValue] = useState('')
  const [signer, setSigner] = useState('')
  const [hasPassword, setHasPassword] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    if (hookValue.length === 0) return
    const { address } = getEthersWalletFromPassword(hookValue) ?? {}
    setSigner(address)
  }, [hookValue])

  const onSavePassword = async () => {
    const walletService = await getWalletService(network)
    const tx = await walletService.setPasswordHookSigner(
      {
        lockAddress,
        contractAddress: hookAddress,
        signerAddress: signer,
        network,
      },
      walletService.signer
    )
    return tx.wait()
  }

  const { data: signers = DEFAULT_USER_ACCOUNT_ADDRESS, isLoading } = useQuery(
    ['getSigners', lockAddress, network],
    async () => {
      return web3Service.getPasswordHookSigners({
        lockAddress,
        contractAddress: hookAddress,
        network,
      })
    },
    {
      onSuccess: (signers: string) => {
        if (signers && signers !== DEFAULT_USER_ACCOUNT_ADDRESS) {
          setHookValue(FAKE_PWD)
          setHasPassword(true)
        }
      },
    }
  )

  const hasSigner =
    signers?.toLowerCase() !== DEFAULT_USER_ACCOUNT_ADDRESS?.toLowerCase()

  const savePasswordMutation = useMutation(onSavePassword, {
    onSuccess: () => {
      setHasPassword(true)
      setHookValue(FAKE_PWD)
    },
  })

  const handleSavePassword = async () => {
    const promise = savePasswordMutation.mutateAsync()

    await ToastHelper.promise(promise, {
      loading: 'Updating password...',
      success: 'Password is set for the lock.',
      error: 'There is an issue with password update.',
    })
  }

  const disabledInput =
    disabled || savePasswordMutation.isLoading || (hasPassword && !isEdit)

  return (
    <ConnectForm>
      {({ getValues, formState: { dirtyFields }, setValue }: any) => {
        const value = getValues(name)

        const isFieldDirty = dirtyFields[name]

        const showInput =
          (value?.length > 0 && value !== DEFAULT_USER_ACCOUNT_ADDRESS) ||
          (selectedOption ?? '')?.length > 0 ||
          isFieldDirty

        if (isLoading) {
          return (
            <>
              <Placeholder.Root className="flex flex-col">
                <Placeholder.Line className="h-5 rounded-none" />
                <div className="w-40 ml-auto">
                  <Placeholder.Line className="h-10" />
                </div>
              </Placeholder.Root>
            </>
          )
        }

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
                      Password already set, add and save a new one to update.{' '}
                    </span>
                  )
                }
                disabled={disabledInput}
              />
              <div className="ml-auto">
                {hasPassword && !isEdit ? (
                  <Button
                    size="small"
                    type="button"
                    onClick={() => {
                      setIsEdit(true)
                      setHookValue('') // reset hook value
                    }}
                  >
                    Edit password
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="small"
                    disabled={
                      disabled ||
                      savePasswordMutation.isLoading ||
                      hookValue.length === 0
                    }
                    onClick={async () => {
                      await handleSavePassword()
                      setValue(name, value)
                    }}
                  >
                    {hasSigner ? 'Update password' : 'Set password'}
                  </Button>
                )}
              </div>
            </div>
          )
        )
      }}
    </ConnectForm>
  )
}
