import { Button } from './Button'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { FaLock as LockIcon } from 'react-icons/fa'
import { CgSpinner as SpinnerIcon } from 'react-icons/cg'

export default {
  component: Button,
  title: 'Button',
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />

export const PrimaryButton = Template.bind({})

PrimaryButton.args = {
  children: 'Connect',
  iconLeft: <LockIcon size={12} />,
}

export const SecondaryButton = Template.bind({})

SecondaryButton.args = {
  children: 'Create Lock',
  size: 'large',
  variant: 'secondary',
  iconLeft: <LockIcon size={14} />,
}

export const DisabledButton = Template.bind({})

DisabledButton.args = {
  children: 'Disabled',
  disabled: true,
  iconRight: <LockIcon size={12} />,
}

export const LoadingButton = Template.bind({})

LoadingButton.args = {
  children: 'Loading Locks...',
  disabled: true,
  iconRight: <SpinnerIcon className='animate-spin motion-reduce:invisible' size={18} />,
}