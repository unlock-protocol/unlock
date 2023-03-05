import { TextBox } from './TextBox'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: TextBox,
  title: 'TextBox',
} satisfies Meta<typeof TextBox>

export default meta
type Story = StoryObj<typeof meta>

export const Normal = {
  args: {
    label: 'Lock description',
    size: 'medium',
    value: 'hello this is a description',
    description: 'this is a description box',
  },
} satisfies Story
