import { ComponentMeta, ComponentStory } from '@storybook/react'
import {
  FaLock as LockIcon,
  FaExclamation as DangerIcon,
  FaCheckCircle as CheckIcon,
} from 'react-icons/fa'

import { Tooltip } from '~/components/Tooltip/Tooltip'
import { Button } from '~/components/Button/Button'
export default {
  component: Tooltip,
  title: 'Tooltip',
} as ComponentMeta<typeof Tooltip>

const Template: ComponentStory<typeof Tooltip> = (args) => (
  <div className="grid items-center justify-center h-screen bg-gray-50">
    <Tooltip {...args} />
  </div>
)

export const Default = Template.bind({})

Default.args = {
  children: <Button variant="primary"> Greet </Button>,
  tip: <p> Greet a person </p>,
  sideOffset: 6,
}

export const TopTooltip = Template.bind({})

TopTooltip.args = {
  children: (
    <button className="p-2 rounded glass-pane">
      <CheckIcon />
    </button>
  ),
  tip: <p> Mark the report </p>,
  sideOffset: 6,
  side: 'top',
}
