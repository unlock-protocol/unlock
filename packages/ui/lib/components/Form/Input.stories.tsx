import { Input } from './Input'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { MdPerson as PersonIcon } from 'react-icons/md'
import { FiAtSign as AtSignIcon } from 'react-icons/fi'
export default {
  component: Input,
  title: 'Input',
} as ComponentMeta<typeof Input>

const Template: ComponentStory<typeof Input> = (args) => <Input {...args} />

export const Normal = Template.bind({})

Normal.args = {
  icon: PersonIcon,
  label: 'Email address',
  size: 'small',
  value: 'email@email.com',
  description:
    'If you have previously created account with Unlock, please enter the same email to contine',
}

export const Password = Template.bind({})

Password.args = {
  icon: PersonIcon,
  label: 'Password',
  size: 'medium',
  type: 'password',
  value: 'email@email.com',
  description: 'Use a long password.',
}

export const Success = Template.bind({})

Success.args = {
  icon: AtSignIcon,
  label: 'Choose username',
  size: 'medium',
  description: 'Pick a nice username',
  success: 'Username is available',
  value: 'unlock',
}

export const Error = Template.bind({})

Error.args = {
  icon: AtSignIcon,
  label: 'Type your username',
  size: 'large',
  error: 'Invalid username',
  value: 'unlock',
  description: 'Type a good username',
  copy: true,
}
