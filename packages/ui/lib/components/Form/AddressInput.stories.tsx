import { AddressInput as AddressInputComponent } from './AddressInput'
import { ComponentMeta, StoryFn } from '@storybook/react'
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