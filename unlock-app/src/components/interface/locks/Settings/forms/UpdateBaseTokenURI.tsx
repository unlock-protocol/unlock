import { useMutation, useQuery } from '@tanstack/react-query'
import { Input, Button } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWalletService } from '~/utils/withWalletService'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface UpdateBaseTokenURIProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface FormProps {
  baseTokenURI: string
}

export const UpdateBaseTokenURI = ({
  lockAddress,
  network,
  disabled,
  isManager,
}: UpdateBaseTokenURIProps) => {
  const web3Service = useWeb3Service()
  const walletService = useWalletService()

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<FormProps>()

  const getTokenURI = async () => {
    return await web3Service.tokenURI(
      lockAddress,
      '0' /* get base tokenURI without extra parameters o token ID*/,
      network
    )
  }

  const setBaseTokenURI = async (fields: FormProps) => {
    await walletService.setBaseTokenURI({
      lockAddress,
      baseTokenURI: fields.baseTokenURI,
    })
  }

  const setBaseTokenURIMutation = useMutation(setBaseTokenURI)

  const onSetBaseTokenURI = async (fields: FormProps) => {
    const setBaseTokenURIPromise = setBaseTokenURIMutation.mutateAsync(fields)
    await ToastHelper.promise(setBaseTokenURIPromise, {
      error: 'Failed to update base token URI.',
      success: 'Base token URI successfully updated.',
      loading: 'Updating Base token URI.',
    })
  }

  const { isLoading: isLoadingTokenURI } = useQuery(
    ['getTokenURI', lockAddress, network, setBaseTokenURIMutation.isSuccess],
    async () => getTokenURI(),
    {
      onSuccess: (value: string) => {
        setValue('baseTokenURI', value)
      },
    }
  )

  const disabledInput =
    disabled || setBaseTokenURIMutation.isLoading || isLoadingTokenURI
  const isLoading = setBaseTokenURIMutation.isLoading || disabledInput

  return (
    <form
      onSubmit={handleSubmit(onSetBaseTokenURI)}
      className="flex flex-col gap-6"
    >
      <div className="relative">
        <Input
          type="url"
          label="Base token URI"
          {...register('baseTokenURI', {
            minLength: 1,
            required: true,
          })}
          autoComplete="off"
          disabled={disabledInput}
          error={
            errors?.baseTokenURI &&
            'Base token URI should have at least 1 character.'
          }
        />
      </div>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={setBaseTokenURIMutation.isLoading || isLoading}
        >
          Update
        </Button>
      )}
    </form>
  )
}
