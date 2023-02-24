import { Meta, StoryObj } from '@storybook/react'
import {
  FaLock as LockIcon,
  FaExclamation as DangerIcon,
  FaCheckCircle as CheckIcon,
} from 'react-icons/fa'
import { CgSpinner as SpinnerIcon } from 'react-icons/cg'
import { Badge } from './Badge'

const meta = {
  component: Badge,
  title: 'Badge',
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    children: 'Locked',
    iconLeft: <LockIcon size={12} />,
  },
} satisfies Story

export const RedBadge = {
  args: {
    children: 'Invalid Key',
    size: 'large',
    variant: 'red',
    iconRight: <DangerIcon size={14} />,
  },
} satisfies Story

export const GreenBadge = {
  args: {
    children: 'Success',
    variant: 'green',
    size: 'tiny',
    iconRight: <CheckIcon size={11} />,
  },
} satisfies Story

export const LoadingBadge = {
  args: {
    children: 'Loading Locks...',
    variant: 'blue',
    iconRight: (
      <SpinnerIcon className="animate-spin motion-reduce:invisible" size={18} />
    ),
  },
} satisfies Story
