import { Alert } from './Alert'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Alert,
  title: 'Alert',
  args: {
    isOpen: true,
    setIsOpen: () => {},
    title: 'Primary Alert',
    text: 'This is a primary alert',
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Primary = {
  args: {
    isOpen: true,
    setIsOpen: () => {},
    title: 'Primary Alert',
    text: 'This is a primary alert',
  },
} satisfies Story
