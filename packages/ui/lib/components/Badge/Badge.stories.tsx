import { ComponentMeta, ComponentStory } from '@storybook/react'
import {
  FaLock as LockIcon,
  FaExclamation as DangerIcon,
  FaCheckCircle as CheckIcon,
} from 'react-icons/fa'
import { CgSpinner as SpinnerIcon } from 'react-icons/cg'
import { Badge } from './Badge'
export default {
  component: Badge,
  title: 'Badge',
} as ComponentMeta<typeof Badge>

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args} />

export const Default = Template.bind({})

Default.args = {
  children: 'Locked',
  iconLeft: <LockIcon size={12} />,
}

export const RedBadge = Template.bind({})

RedBadge.args = {
  children: 'Invalid Key',
  size: 'large',
  variant: 'red',
  iconRight: <DangerIcon size={14} />,
}

export const GreenBadge = Template.bind({})

GreenBadge.args = {
  children: 'Success',
  variant: 'green',
  size: 'tiny',
  iconRight: <CheckIcon size={11} />,
}

export const LoadingBadge = Template.bind({})

LoadingBadge.args = {
  children: 'Loading Locks...',
  variant: 'blue',
  iconRight: (
    <SpinnerIcon className="animate-spin motion-reduce:invisible" size={18} />
  ),
}
