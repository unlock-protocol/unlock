import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Toggle } from './Toggle'

export default {
  component: Toggle,
  title: 'Toggle',
} as ComponentMeta<typeof Toggle>

const Template: ComponentStory<typeof Toggle> = (args) => (
  <div className="grid items-center justify-center h-screen bg-gray-50">
    <Toggle {...args} />
  </div>
)

export const Default = Template.bind({})

Default.args = {
  value: true,
  onChange: () => {},
  size: 'medium',
}
