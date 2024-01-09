import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import { ChangeEvent, useEffect, useState } from 'react'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { CustomComponentProps } from '../UpdateHooksForm'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { getEthersWalletFromPassword } from '~/utils/strings'
import { useFormContext } from 'react-hook-form'

const FAKE_PWD = 'fakepwd'
export const PasswordContractHook = ({
  name,
  disabled,
  selectedOption,
  lockAddress,
  network,
  hookAddress,
  setEventsHooksMutation,
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
    console.log('SAVE!')
    // const promise = savePasswordMutation.mutateAsync()

    // await ToastHelper.promise(promise, {
    //   loading: 'Updating password...',
    //   success: 'Password is set for the lock.',
    //   error: 'There is an issue with password update.',
    // })
  }

  const disabledInput =
    disabled || savePasswordMutation.isLoading || (hasPassword && !isEdit)
  const { getValues, formState, setValue } = useFormContext()

  const value = getValues(name)

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
    <div className="flex flex-col gap-2">
      <Input
        size="small"
        label="Password"
        type="password"
        value={hookValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setHookValue(e?.target?.value)
        }
        description={
          hasSigner && (
            <span>
              There is already a password set, enter and save a new one to
              update.{' '}
            </span>
          )
        }
        disabled={disabledInput}
      />
      <div className="ml-auto">
        <Button
          type="button"
          size="small"
          disabled={savePasswordMutation.isLoading || hookValue.length === 0}
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
}
