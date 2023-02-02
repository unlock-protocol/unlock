import { AddressInput as AddressInputComponent } from './AddressInput'
import { ComponentMeta, StoryFn } from '@storybook/react'
import { FaWallet as WalletIcon } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons'
import { useForm } from 'react-hook-form';

export default {
  component: AddressInputComponent,
  title: 'AddressInput',
} as ComponentMeta<typeof AddressInputComponent>

export const AddressInput: StoryFn<typeof AddressInputComponent> = () => {
  const localForm = useForm();

  return (
    <AddressInputComponent
      withIcon={true}
      label='Wallet address'
      size='small'
      description='Enter your wallet address'
      isTruncated={false}
      name='manager'
      localForm={localForm}
      web3Service={localForm}
    />
  );
}


// export const Normal = Template.bind({})

// Normal.args = {
//   withIcon: true,
//   label: 'Wallet address',
//   size: 'small',
//   value: '',
//   description:
//     'Enter your wallet address',
//   isTruncated: false,
//   name: 'manager',
//   localForm: localForm
// }

// function CustomizedIcon(props: IconBaseProps) {
//   return <WalletIcon {...props} className="fill-gray-500" />
// }

// export const Success = Template.bind({})

// Success.args = {
//   withIcon: true,
//   label: 'Wallet address',
//   size: 'small',
//   description: 'Enter a valid wallet address or ens',
//   value: 'souravinsights.eth',
//   isTruncated: false,
// }

// export const Error = Template.bind({})

// Error.args = {
//   withIcon: true,
//   label: 'Wallet address',
//   size: 'small',
//   value: 'souravinghts.eth',
//   description: 'Enter a valid wallet address or ens',
//   isTruncated: false,
// }

// export const TruncatedAddress = Template.bind({})

// TruncatedAddress.args = {
//   withIcon: true,
//   label: 'Wallet address',
//   size: 'small',
//   description: 'Enter your wallet address',
//   value: 'souravinsights.eth',
//   isTruncated: true,
// }