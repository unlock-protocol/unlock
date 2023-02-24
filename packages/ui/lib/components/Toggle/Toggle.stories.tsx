import { Meta, StoryFn } from '@storybook/react'
import { Toggle } from './Toggle'

const meta = {
  component: Toggle,
  title: 'Toggle',
  args: {
    value: false,
    onChange: () => {},
    size: 'medium',
  },
} satisfies Meta<typeof Toggle>

export default meta

export const Default: StoryFn<typeof Toggle> = (args) => {
  return (
    <div className="grid items-center justify-center h-screen bg-gray-50">
      <Toggle {...args} />
    </div>
  )
}
