import { ComponentMeta, ComponentStory } from '@storybook/react'
import { AddressInput } from './AddressInput'
import { Controller, useForm, useWatch } from 'react-hook-form'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Button } from '../Button/Button'
import { useEffect } from 'react'

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
  const { handleSubmit, control, setValue } = localForm

  const queryCache = new QueryCache()
  const queryClient = new QueryClient({
    queryCache,
  })

  useWatch({
    control,
  })

  useEffect(() => {
    setValue('address', 'demo.eth')
  }, [])

  const onSubmit = (form: any) => {
    console.log('form values', form)
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
          render={({ field: { onChange } }) => {
            return (
              <>
                <AddressInput
                  withIcon
                  label="Manager address or ens"
                  name="address"
                  description="Address of the manager"
                  onChange={onChange}
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
