import { Button } from './Button'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { FaLock as LockIcon } from 'react-icons/fa'
export default {
  component: Button,
  title: 'Button',
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />

export const Primary = Template.bind({})

Primary.args = {
  children: 'Lock Button',
  leftIcon: <LockIcon size={12} />,
}


export const ButtonWithRightIcon = Template.bind({})

ButtonWithRightIcon.args = {
  children: 'Button with right icon',
  size:"large",
  rightIcon: <LockIcon size={14} />,
}
