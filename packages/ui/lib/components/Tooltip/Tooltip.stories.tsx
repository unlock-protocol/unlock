import { Meta, StoryFn, StoryObj } from '@storybook/react'
import { FaCheckCircle as CheckIcon } from 'react-icons/fa'

import { Tooltip } from '~/components/Tooltip/Tooltip'
import { Button } from '~/components/Button/Button'
const meta = {
  component: Tooltip,
  title: 'Tooltip',
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

const Template: StoryFn<typeof Tooltip> = (args) => (
  <div className="grid items-center justify-center h-screen bg-gray-50">
    <Tooltip {...args} />
  </div>
)

export const Default = {
  ...Template,
  args: {
    children: <Button variant="primary"> Greet </Button>,
    tip: <p> Greet a person </p>,
    sideOffset: 6,
  },
} satisfies Story

export const TopTooltip = {
  ...Template,
  args: {
    children: (
      <button className="p-2 rounded glass-pane">
        <CheckIcon />
      </button>
    ),
    tip: <p> Mark the report </p>,
    sideOffset: 6,
    side: 'top',
  },
} satisfies Story
