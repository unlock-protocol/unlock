import { Box } from './Box'
import { Meta, StoryObj } from '@storybook/react'
import { Button } from '../Button/Button'

const meta = {
  component: Box,
  title: 'Box',
} satisfies Meta<typeof Box>

export default meta
type Story = StoryObj<typeof meta>

export const BoxAsButton = {
  args: {
    children: 'Connect',
    as: Button,
  },
} satisfies Story
