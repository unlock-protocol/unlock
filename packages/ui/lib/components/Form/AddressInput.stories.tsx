import { ComponentMeta, ComponentStory } from '@storybook/react'
import { AddressInput } from './AddressInput'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { useForm } from 'react-hook-form'
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
      address: 'demo.eth',
    },
  })
  const { handleSubmit } = localForm
  const web3Service = new Web3Service(networks)

  const queryCache = new QueryCache()
  const queryClient = new QueryClient({
    queryCache,
  })

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
        <AddressInput
          withIcon
          label="Manager address or ens"
          name="address"
          description="Address of the manager"
          localForm={localForm}
          web3Service={web3Service}
        />
        <Button type="submit">Send</Button>
      </form>
    </QueryClientProvider>
  )
}

export const Normal = Template.bind({})
