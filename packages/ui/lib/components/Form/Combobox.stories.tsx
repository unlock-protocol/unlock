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

const allOptions = [
  { value: 1, label: 'Ethereum Mainnet' },
  { value: 84532, label: 'Base' },
  { value: 10, label: 'Optimism' },
  { value: 56, label: 'BNB Chain' },
  { value: 43114, label: 'Avalanche' },
  { value: 100, label: 'Gnosis Chain' },
  { value: 137, label: 'Polygon' },
  { value: 42161, label: 'Arbitrum One' },
]

interface Option {
  value: number
  label: string
}

const getRandomItems = (array: Option[], count: number): Option[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export const Default = {
  args: {
    initialOptions: getRandomItems(allOptions, 5),
    moreOptions: getRandomItems(allOptions, 3),
    initialSelected: { value: 1, label: 'Ethereum Mainnet' },
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story

export const WithInitialSelected = {
  args: {
    initialOptions: getRandomItems(allOptions, 5),
    moreOptions: getRandomItems(allOptions, 3),
    initialSelected: { value: 84532, label: 'Base' },
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story

export const WithLongList = {
  args: {
    initialOptions: getRandomItems(
      Array.from({ length: 50 }, (_, index) => ({
        value: index + 1,
        label: `Network #${index + 1}`,
      })),
      10
    ),
    moreOptions: getRandomItems(
      Array.from({ length: 50 }, (_, index) => ({
        value: index + 51,
        label: `Network #${index + 51}`,
      })),
      40
    ),
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story

export const WithoutMoreOptions = {
  args: {
    initialOptions: getRandomItems(allOptions, allOptions.length),
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story

export const WithDuplicates = {
  args: {
    initialOptions: getRandomItems(allOptions, 5),
    moreOptions: getRandomItems([...allOptions, ...allOptions], 5),
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story
