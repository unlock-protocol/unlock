import { Input } from './Input'
import { Meta, StoryObj } from '@storybook/react'
import { MdPerson as PersonIcon } from 'react-icons/md'
import { FiAtSign as AtSignIcon } from 'react-icons/fi'
import { IconBaseProps } from 'react-icons'

const meta = {
  component: Input,
  title: 'Input',
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Normal = {
  args: {
    icon: PersonIcon,
    label: 'Email address',
    size: 'small',
    value: 'email@email.com',
    description:
      'If you have previously created account with Unlock, please enter the same email to continue',
  },
} satisfies Story

export const Required = {
  args: {
    required: true,
    label: 'Full Name',
    description: 'Enter your full name',
  },
} satisfies Story

export const Optional = {
  args: {
    optional: true,
    label: 'Full Name',
  },
} satisfies Story

function CustomizedIcon(props: IconBaseProps) {
  return <PersonIcon {...props} className="fill-gray-500" />
}

export const Password = {
  args: {
    icon: CustomizedIcon,
    label: 'Password',
    size: 'medium',
    type: 'password',
    value: 'email@email.com',
    description: 'Use a long password.',
  },
} satisfies Story

export const Success = {
  args: {
    icon: AtSignIcon,
    label: 'Choose username',
    size: 'medium',
    description: 'Pick a nice username',
    success: 'Username is available',
    value: 'unlock',
  },
} satisfies Story

export const Error = {
  args: {
    icon: AtSignIcon,
    label: 'Type your username',
    size: 'large',
    error: 'Invalid username',
    value: 'unlock',
    description: 'Type a good username',
    copy: true,
  },
} satisfies Story

export const CustomDescription = {
  args: {
    icon: AtSignIcon,
    label: 'Type your username',
    size: 'large',
    error: 'Invalid username',
    value: 'unlock',
    description: 'Type a good username',
    copy: true,
  },
} satisfies Story
