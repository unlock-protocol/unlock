import { Alert } from './Alert'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  component: Alert,
  title: 'Alert',
} as ComponentMeta<typeof Alert>

const Template: ComponentStory<typeof Alert> = (args) => <Alert {...args} />

export const Primary = Template.bind({})

Primary.args = {
    isOpen: true,
    setIsOpen: () => {},
    title: "Primary Alert",
    text: "This is a primary alert"
}


