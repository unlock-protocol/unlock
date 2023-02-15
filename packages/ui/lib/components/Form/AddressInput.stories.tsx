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

export default {
  component: AddressInput,
  title: 'AddressInput',
} as ComponentMeta<typeof AddressInput>

const Template: ComponentStory<typeof AddressInput> = () => {
  const localForm = useForm()
  const web3Service = new Web3Service(networks)

  const queryCache = new QueryCache()
  const queryClient = new QueryClient({
    queryCache,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AddressInput
        withIcon
        label="Manager address or ens"
        name="address"
        description="Address of the manager"
        localForm={localForm}
        web3Service={web3Service}
      />
    </QueryClientProvider>
  )
}

export const Normal = Template.bind({})
