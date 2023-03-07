import { CryptoIcon } from './CustomIcon'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: CryptoIcon,
  title: 'CryptoIcon',
} satisfies Meta<typeof CryptoIcon>

export default meta

type Story = StoryObj<typeof meta>

export const CryptoIconComponent = {
  args: {
    id: 'eth',
    size: 24,
  },
} as Story

export const CryptoIconFallbackComponent = {
  args: {
    id: 'unknown',
    size: 24,
  },
} as Story
