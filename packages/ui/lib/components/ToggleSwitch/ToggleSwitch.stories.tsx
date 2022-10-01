import { ComponentMeta, ComponentStory } from '@storybook/react'
import { ToggleSwitch } from './ToggleSwitch'

export default {
  component: ToggleSwitch,
  title: 'ToggleSwitch',
} as ComponentMeta<typeof ToggleSwitch>

const Template: ComponentStory<typeof ToggleSwitch> = (args) => (
  <div className="grid items-center justify-center h-screen bg-gray-50">
    <ToggleSwitch {...args} />
  </div>
)

export const Default = Template.bind({})

Default.args = {
  title: 'Example',
  enabled: true,
  setEnabled: () => void 0,
}
