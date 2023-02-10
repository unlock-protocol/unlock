import { useMutation } from '@tanstack/react-query'
import { Button, Input } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'

interface UpdateNameFormProps {
  disabled: boolean
  isManager: boolean
  lockAddress: string
  lockName: string
  network: number
}

interface FormProps {
  name: string
}

export const UpdateNameForm = ({
  disabled,
  isManager,
  lockAddress,
  lockName,
  network,
}: UpdateNameFormProps) => {
  const { getWalletService } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useForm<FormProps>({
    defaultValues: {
      name: lockName,
    },
  })

  const changeName = async (name: string) => {
    const walletService = await getWalletService(network)
    return await walletService.updateLockName({
      lockAddress,
      name,
    })
  }

  const changeNameMutation = useMutation(changeName)

  const onChangeName = async ({ name }: FormProps) => {
    if (!isManager) return
    if (isValid) {
      const changeNamePromise = changeNameMutation.mutateAsync(name)
      await ToastHelper.promise(changeNamePromise, {
        loading: 'Updating lock name.',
        success: 'Lock name updated.',
        error: 'There is an issue updating the lock name.',
      })
    } else {
      ToastHelper.error('Form is not valid.')
      reset()
    }
  }

  const disabledInput = disabled || changeNameMutation.isLoading
  const updateMetadataUrl = `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onChangeName)}>
      <div className="relative">
        <Input
          {...register('name', {
            minLength: 3,
            required: true,
          })}
          error={errors?.name && 'Lock name should have at least 3 characters.'}
          autoComplete="off"
          disabled={disabledInput}
          description={
            <span>
              <span className="flex gap-1">
                <span>
                  This value will be set on the contract but the NFT metadata
                  will remain unchanged if you have set a value there.
                </span>
                <Link
                  href={updateMetadataUrl}
                  className="font-bold cursor-pointer text-brand-ui-primary"
                >
                  Edit NFT properties
                </Link>
              </span>
            </span>
          }
        />
      </div>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={changeNameMutation.isLoading}
        >
          Update
        </Button>
      )}
    </form>
  )
}
