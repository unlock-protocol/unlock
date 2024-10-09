import { Meta, StoryObj } from '@storybook/react'
import { Combobox } from './Combobox'

const meta = {
  title: 'Combobox',
  component: Combobox,
  argTypes: {
    onSelect: { action: 'selected' },
  },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    options: [
      { value: 1, label: 'Ethereum Mainnet' },
      { value: 84532, label: 'Base' },
      { value: 10, label: 'Optimism' },
      { value: 56, label: 'BNB Chain' },
      { value: 43114, label: 'Avalanche' },
      { value: 100, label: 'Gnosis Chain' },
      { value: 137, label: 'Polygon' },
      { value: 42161, label: 'Arbitrum One' },
    ],
    initialSelected: { value: 1, label: 'Ethereum Mainnet' },
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story

export const WithInitialSelected = {
  args: {
    options: [
      { value: 1, label: 'Ethereum Mainnet' },
      { value: 84532, label: 'Base' },
      { value: 10, label: 'Optimism' },
      { value: 56, label: 'BNB Chain' },
      { value: 43114, label: 'Avalanche' },
      { value: 100, label: 'Gnosis Chain' },
      { value: 137, label: 'Polygon' },
      { value: 42161, label: 'Arbitrum One' },
    ],
    initialSelected: { value: 84532, label: 'Base' },
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story

export const WithLongList = {
  args: {
    options: Array.from({ length: 50 }, (_, index) => ({
      value: index + 1,
      label: `Network #${index + 1}`,
    })),
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story
