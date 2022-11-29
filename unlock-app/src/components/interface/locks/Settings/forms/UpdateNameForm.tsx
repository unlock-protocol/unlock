import { useMutation } from '@tanstack/react-query'
import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'

interface UpdateNameFormProps {
  disabled: boolean
  isManager: boolean
  lockAddress: string
  lockName: string
}

interface FormProps {
  name: string
}

export const UpdateNameForm = ({
  disabled,
  isManager,
  lockAddress,
  lockName,
}: UpdateNameFormProps) => {
  const walletService = useWalletService()
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
