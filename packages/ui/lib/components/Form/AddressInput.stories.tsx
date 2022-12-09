import { AddressInput } from './AddressInput'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { FiAtSign as AtSignIcon } from 'react-icons/fi'
import { FaWallet as WalletIcon } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons'

export default {
  component: AddressInput,
  title: 'AddressInput',
} as ComponentMeta<typeof AddressInput>

const Template: ComponentStory<typeof AddressInput> = (args) => <AddressInput {...args} />

export const Normal = Template.bind({})

Normal.args = {
  icon: WalletIcon,
  label: 'Wallet address',
  size: 'small',
  value: '0xF95f8038Eb7874Cde88A0A9a8270fcC94f5C226e',
  description:
    'Enter your wallet address',
}

function CustomizedIcon(props: IconBaseProps) {
  return <WalletIcon {...props} className="fill-gray-500" />
}

export const Success = Template.bind({})

Success.args = {
  icon: CustomizedIcon,
  label: 'Wallet address',
  size: 'medium',
  description: 'Enter your wallet address',
  success: 'Wallet address is valid',
  value: '0xF95f8038Eb7874Cde88A0A9a8270fcC94f5C226e',
}

export const Error = Template.bind({})

Error.args = {
  icon: CustomizedIcon,
  label: 'Wallet address',
  size: 'large',
  error: 'Invalid wallet address',
  value: '0xjf8038Eb7874Cd88A0A9a8270fcC94f5C226e',
  description: 'Enter a valid wallet address',
}

export const CustomDescription = Template.bind({})

const Description = () => (
  <div>
    Check out this{' '}
    <a className="underline" href="https://example.com" target="#">
      link
    </a>
  </div>
)

CustomDescription.args = {
  icon: CustomizedIcon,
  label: 'Enter your wallet address',
  value: 'unlock',
  description: <Description />,
}
