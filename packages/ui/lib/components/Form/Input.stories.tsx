import { Input } from './Input'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { MdPerson as PersonIcon } from 'react-icons/md'
import { FiAtSign as AtSignIcon } from 'react-icons/fi'
export default {
  component: Input,
  title: 'Input',
} as ComponentMeta<typeof Input>

const Template: ComponentStory<typeof Input> = (args) => <Input {...args} />

export const Success = Template.bind({})

Success.args = {
  icon: <PersonIcon size={20} />,
  label: 'Enter your name',
  size: 'medium',
  state: 'success',
  message: 'Correct name',
  value: 'John Doe',
}

export const Error = Template.bind({})

Error.args = {
  icon: <AtSignIcon size={20} />,
  label: 'Type your username',
  size: 'large',
  state: 'error',
  value: 'unlock',
  message: 'Username not available',
}
