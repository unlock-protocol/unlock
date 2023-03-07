import { CustomIcon } from './CustomIcon'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: CustomIcon,
  title: 'CustomIcon',
} satisfies Meta<typeof CustomIcon>

export default meta

type Story = StoryObj<typeof meta>

export const CustomIconComponent = {
  args: {
    id: 'crypto',
    size: 24,
  },
} as Story
