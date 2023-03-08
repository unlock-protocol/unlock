import { CryptoIcon } from './CryptoIcon'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: CryptoIcon,
  title: 'CryptoIcon',
} satisfies Meta<typeof CryptoIcon>

export default meta

type Story = StoryObj<typeof meta>

export const CryptoIconComponent = {
  args: {
    symbol: 'eth',
    size: 24,
  },
} as Story

export const CryptoIconFallbackComponent = {
  args: {
    symbol: 'unknown',
    size: 24,
  },
} as Story
