import { Button } from './Button'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  component: Button,
  title: 'Button',
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />

export const Primary = Template.bind({})

Primary.args = {
  children: 'Primary button',
}
