import { Meta, StoryFn } from '@storybook/react'
import { AddressInput } from './AddressInput'
import { Controller, useForm, useWatch } from 'react-hook-form'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Button } from '../Button/Button'
import { isAddressOrEns } from '~/utils'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { networks } from '@unlock-protocol/networks'

const meta = {
  component: AddressInput,
  title: 'AddressInput',
} satisfies Meta<typeof AddressInput>

export default meta

export const Default: StoryFn<typeof meta> = () => {
  const localForm = useForm({
    defaultValues: {
      address: '0xfC43f5F9dd45258b3AFf31Bdbe6561D97e8B71de',
    },
  })
  const { handleSubmit, control, reset, setValue } = localForm

  const queryCache = new QueryCache()
  const queryClient = new QueryClient({
    queryCache,
  })

  const { address } = useWatch({
    control,
  })

  const onSubmit = (_form: any, _e: any) => {
    reset({
      address: '',
    })
  }

  const onError = (_error: any) => {
    // on error code
  }

  const onResolveName = async (address: string) => {
    if (address.length === 0) return
    const web3Service = new Web3Service(networks)
    return await web3Service.resolveName(address)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <form
        className="flex flex-col gap-3"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <Controller
          control={control}
          name="address"
          rules={{
            required: true,
            validate: isAddressOrEns,
          }}
          render={({ field: { value } }) => {
            return (
              <>
                <AddressInput
                  withIcon
                  value={address}
                  label="Manager address or ens"
                  description="Address of the manager"
                  defaultValue={value}
                  onChange={(value: any) => {
                    setValue('address', value)
                  }}
                  onResolveName={onResolveName}
                />
              </>
            )
          }}
        />

        <Button type="submit">Send</Button>
      </form>
    </QueryClientProvider>
  )
}
