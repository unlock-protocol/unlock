import { Collapse } from './Collapse'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Collapse,
  title: 'Collapse',
} satisfies Meta<typeof Collapse>

export default meta
type Story = StoryObj<typeof meta>

export const CollapseDefault = {
  args: {
    isOpen: true,
    children: <span>Children content</span>,
    content: (
      <div className="flex justify-between">
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </div>
    ),
    disabled: false,
  },
} satisfies Story

export const CollapseDisabled = {
  args: {
    isOpen: true,
    children: <span>Children content</span>,
    content: (
      <div className="flex justify-between">
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </div>
    ),
    disabled: true,
  },
} satisfies Story

export const CollapseOpen = {
  args: {
    children: <span>Children content</span>,
    content: (
      <div className="flex justify-between">
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </div>
    ),
    disabled: true,
    isOpen: true,
  },
} satisfies Story
