import { Checkbox } from './Checkbox'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Checkbox,
  title: 'Checkbox',
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Normal = {
  args: {
    label: 'Is this a checkbox?',
    description: 'Please check this box if you want to proceed with the action',
  },
} satisfies Story

export const Error = {
  args: {
    label: 'Is this a checkbox?',
    fieldSize: 'large',
    error: 'Yes it is!',
  },
} satisfies Story
