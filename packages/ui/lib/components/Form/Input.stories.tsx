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
  icon: <PersonIcon size={16} />,
  label: 'Email address',
  size: 'small',
  value: 'email@email.com',
  message:
    'If you have previously created account with Unlock, please enter the same email to contine',
}

export const Reveal = Template.bind({})

Reveal.args = {
  icon: <PersonIcon size={16} />,
  label: 'Password',
  size: 'medium',
  value: 'password',
  type: 'password',
  copy: true,
  message: 'Use a long password.',
}

export const Success = Template.bind({})

Success.args = {
  icon: <AtSignIcon size={18} />,
  label: 'Choose username',
  size: 'medium',
  state: 'success',
  message: 'Username available',
  value: 'unlock',
}

export const Error = Template.bind({})

Error.args = {
  icon: <AtSignIcon size={20} />,
  label: 'Type your username',
  size: 'large',
  state: 'error',
  value: 'unlock',
  copy: true,
  message: 'Username not available',
}
