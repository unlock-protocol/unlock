import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { CustomComponentProps } from '../UpdateHooksForm'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { getEthersWalletFromPassword } from '~/utils/strings'
import { useFormContext } from 'react-hook-form'

export const PasswordContractHook = ({
  disabled,
  lockAddress,
  network,
  hookAddress,
  setEventsHooksMutation,
}: CustomComponentProps) => {
  const { getWalletService } = useAuth()
  const web3Service = useWeb3Service()

  const onSavePassword = async (password: string) => {
    const { address: signerAddress } =
      getEthersWalletFromPassword(password) ?? {}
    const walletService = await getWalletService(network)
    const tx = await walletService.setPasswordHookSigner(
      {
        lockAddress,
        contractAddress: hookAddress,
        signerAddress,
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
    }
  )

  const hasSigner =
    signers?.toLowerCase() !== DEFAULT_USER_ACCOUNT_ADDRESS?.toLowerCase()

  const savePasswordMutation = useMutation(onSavePassword)

  const onSubmit = async ({ hook, ...rest }: any) => {
    await setEventsHooksMutation.mutateAsync(rest)
    const promise = savePasswordMutation.mutateAsync(hook.password)
    await ToastHelper.promise(promise, {
      loading: 'Updating password...',
      success: 'Password is set for the lock.',
      error: 'There is an issue with password update.',
    })
  }

  const disabledInput = disabled || savePasswordMutation.isLoading

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useFormContext()

  if (isLoading) {
    return (
      <Placeholder.Root className="flex flex-col">
        <Placeholder.Line className="h-5 rounded-none" />
        <div className="w-40 ml-auto">
          <Placeholder.Line className="h-10" />
        </div>
      </Placeholder.Root>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <Input
        size="small"
        label="Password"
        type="password"
        {...register('hook.password', {
          required: {
            value: true,
            message: 'Please enter a password',
          },
        })}
        // @ts-expect-error Property 'password' does not exist on type 'FieldError'.
        error={errors?.hook?.password?.message as unknown as string}
        autoComplete="new-password"
        description={
          hasSigner && (
            <span>
              There is already a password set, enter and save a new one to
              update it.{' '}
            </span>
          )
        }
        disabled={disabledInput}
      />
      <div className="ml-auto">
        <Button
          type="submit"
          size="small"
          loading={
            savePasswordMutation.isLoading || setEventsHooksMutation.isLoading
          }
          disabled={savePasswordMutation.isLoading}
        >
          {hasSigner ? 'Update password' : 'Set password'}
        </Button>
      </div>
    </form>
  )
}
