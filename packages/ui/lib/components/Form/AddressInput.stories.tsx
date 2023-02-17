import { ComponentMeta, ComponentStory } from '@storybook/react'
import { AddressInput } from './AddressInput'
import { Controller, useForm, useWatch } from 'react-hook-form'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Button } from '../Button/Button'

export default {
  component: AddressInput,
  title: 'AddressInput',
} as ComponentMeta<typeof AddressInput>

const Template: ComponentStory<typeof AddressInput> = () => {
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

  const onSubmit = (form: any, e: any) => {
    reset({
      address: '',
    })
  }

  const onError = (error: any) => {
    console.log('error value', error)
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

export const Normal = Template.bind({})
