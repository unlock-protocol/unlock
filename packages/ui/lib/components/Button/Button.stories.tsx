import { Button } from './Button'
import { Meta, StoryObj } from '@storybook/react'
import { FaLock as LockIcon } from 'react-icons/fa'

const meta = {
  component: Button,
  title: 'Button',
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const PrimaryButton = {
  args: {
    children: 'Connect',
    iconLeft: <LockIcon size={12} />,
  },
} satisfies Story

export const SecondaryButton = {
  args: {
    children: 'Create Lock',
    size: 'large',
    variant: 'secondary',
    iconLeft: <LockIcon size={14} />,
  },
} satisfies Story

export const DisabledButton = {
  args: {
    children: 'Disabled',
    disabled: true,
    iconRight: <LockIcon size={12} />,
  },
} satisfies Story

export const LoadingButton = {
  args: {
    children: 'Loading Locks...',
    disabled: true,
    loading: true,
  },
} satisfies Story

export const OutlinedPrimaryButton = {
  args: {
    children: 'Outlined Primary Button',
    variant: 'outlined-primary',
  },
} satisfies Story

export const DisabledOutlinedPrimaryButton = {
  args: {
    children: 'Disabled Outlined Primary Button',
    variant: 'outlined-primary',
    disabled: true,
  },
} satisfies Story
