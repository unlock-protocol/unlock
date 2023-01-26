import { AddressInput } from './AddressInput'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { FaWallet as WalletIcon } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons'

export default {
  component: AddressInput,
  title: 'AddressInput',
} as ComponentMeta<typeof AddressInput>

const Template: ComponentStory<typeof AddressInput> = (args) => <AddressInput {...args} />

export const Normal = Template.bind({})

Normal.args = {
  withIcon: true,
  label: 'Wallet address',
  size: 'small',
  value: '',
  description:
    'Enter your wallet address',
  isTruncated: false
}

function CustomizedIcon(props: IconBaseProps) {
  return <WalletIcon {...props} className="fill-gray-500" />
}

export const Success = Template.bind({})

Success.args = {
  withIcon: true,
  label: 'Wallet address',
  size: 'small',
  description: 'Enter a valid wallet address or ens',
  value: 'souravinsights.eth',
  isTruncated: false,
}

export const Error = Template.bind({})

Error.args = {
  withIcon: true,
  label: 'Wallet address',
  size: 'small',
  value: 'souravinghts.eth',
  description: 'Enter a valid wallet address or ens',
  isTruncated: false,
}

export const TruncatedAddress = Template.bind({})

TruncatedAddress.args = {
  withIcon: true,
  label: 'Wallet address',
  size: 'small',
  description: 'Enter your wallet address',
  value: 'souravinsights.eth',
  isTruncated: true,
}