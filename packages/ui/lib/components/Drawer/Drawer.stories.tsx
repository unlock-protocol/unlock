import { Drawer } from './Drawer'
import { Meta, StoryObj } from '@storybook/react'
import { Button } from '../Button/Button'

const meta = {
  component: Drawer,
  title: 'Drawer',
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Primary = {
  args: {
    isOpen: true,
    setIsOpen: () => {},
    title: 'Primary Drawer',
    description: 'This is a primary drawer.',
    children: (
      <div className="space-y-2">
        <p> This is a drawer. </p>
        <Button> Confirm </Button>
      </div>
    ),
  },
} satisfies Story
