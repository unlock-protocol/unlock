import { TextBox } from './TextBox'
import { ComponentMeta, ComponentStory } from '@storybook/react'
export default {
  component: TextBox,
  title: 'TextBox',
} as ComponentMeta<typeof TextBox>

const Template: ComponentStory<typeof TextBox> = (args) => <TextBox {...args} />

export const Normal = Template.bind({})

Normal.args = {
  label: 'Lock description',
  size: 'medium',
  value: 'hello this is a description',
  description: 'this is a description box',
}
