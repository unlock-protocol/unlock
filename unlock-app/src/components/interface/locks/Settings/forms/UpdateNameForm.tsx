import { useMutation } from '@tanstack/react-query'
import { Button, Input } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { UpdateMetadataDrawer } from '../../metadata/MetadataUpdate'

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
  const [updateMetadata, setUpdateMetadata] = useState(false)
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
    <>
      <UpdateMetadataDrawer
        isOpen={updateMetadata}
        setIsOpen={setUpdateMetadata}
      />

      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(onChangeName)}
      >
        <div className="relative">
          <Input
            {...register('name', {
              minLength: 3,
              required: true,
            })}
            error={
              errors?.name && 'Lock name should have at least 3 characters.'
            }
            autoComplete="off"
            disabled={disabledInput}
            description={
              <span>
                <span className="flex gap-1">
                  <span>
                    This value will not appear when NFT metadata name is set.
                  </span>
                  <Button
                    onClick={() => setUpdateMetadata(!updateMetadata)}
                    className="font-bold cursor-pointer text-brand-ui-primary"
                    variant="borderless"
                    size="small"
                  >
                    Edit NFT properties
                  </Button>
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
    </>
  )
}
