import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { ChangeEvent, useEffect, useState } from 'react'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { ConnectForm } from '../../../CheckoutUrl/elements/DynamicForm'
import { CustomComponentProps } from '../UpdateHooksForm'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'

export const PasswordContractHook = ({
  name,
  disabled,
  selectedOption,
  lockAddress,
  network,
  address,
}: CustomComponentProps) => {
  const { getWalletService } = useAuth()
  const web3Service = useWeb3Service()
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
    const tx = await web3Service.setPasswordHookSigner(
      {
        lockAddress,
        contractAddress: address,
        signerAddress: signer,
        network,
      },
      walletService.signer
    )
    return tx.wait()
  }

  const getSigners = async () => {
    const walletService = await getWalletService(network)
    return await web3Service.getPasswordHookSigners(
      {
        lockAddress,
        contractAddress: address,
        network,
      },
      walletService.signer
    )
  }

  const { data: signers = DEFAULT_USER_ACCOUNT_ADDRESS, isLoading } = useQuery(
    ['getSigners', lockAddress, network],
    async () => {
      return getSigners()
    }
  )

  const hasSigner =
    signers?.toLowerCase() !== DEFAULT_USER_ACCOUNT_ADDRESS?.toLowerCase()

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
                disabled={disabled || savePasswordMutation.isLoading}
              />
              <div className="ml-auto">
                <Button
                  type="button"
                  size="small"
                  disabled={disabled || savePasswordMutation.isLoading}
                  onClick={async () => {
                    await handleSavePassword()
                    setValue(name, value)
                  }}
                >
                  {hasSigner ? 'Update password' : 'Set password'}
                </Button>
              </div>
            </div>
          )
        )
      }}
    </ConnectForm>
  )
}
