import { Meta, StoryFn } from '@storybook/react'
import { ToggleSwitch } from './ToggleSwitch'

const meta = {
  component: ToggleSwitch,
  title: 'ToggleSwitch',
  args: {
    title: 'Example',
    enabled: true,
    setEnabled: () => void 0,
    description: 'Example with description',
  },
} satisfies Meta<typeof ToggleSwitch>

export default meta

export const Template: StoryFn<typeof ToggleSwitch> = (args) => (
  <div className="grid items-center justify-center h-screen bg-gray-50">
    <ToggleSwitch {...args} />
  </div>
)
