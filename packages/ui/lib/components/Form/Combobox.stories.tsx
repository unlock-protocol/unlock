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

// Define all possible options for the Combobox
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

// Helper function to get a random subset of items from an array
const getRandomItems = (array: Option[], count: number): Option[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Default story with a mix of initial and more options
export const Default = {
  args: {
    options: getRandomItems(allOptions, 5),
    moreOptions: getRandomItems(allOptions, 3),
    initialSelected: { value: 1, label: 'Ethereum Mainnet' },
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story

// Story with a pre-selected option
export const WithInitialSelected = {
  args: {
    options: getRandomItems(allOptions, 5),
    moreOptions: getRandomItems(allOptions, 3),
    initialSelected: { value: 84532, label: 'Base' },
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story

// Story with a large number of options to test scrolling behavior
export const WithLongList = {
  args: {
    // Generate 10 initial options
    options: getRandomItems(
      Array.from({ length: 50 }, (_, index) => ({
        value: index + 1,
        label: `Network #${index + 1}`,
      })),
      10
    ),
    // Generate 40 more options
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

// Story without any additional options in the "More options" section
export const WithoutMoreOptions = {
  args: {
    options: getRandomItems(allOptions, allOptions.length),
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story

// Story with duplicate options to test handling of non-unique values
export const WithDuplicates = {
  args: {
    options: getRandomItems(allOptions, 5),
    // Duplicate the options array
    moreOptions: getRandomItems([...allOptions, ...allOptions], 5),
    onSelect: (selected) => {
      console.log('selected', selected)
    },
  },
} satisfies Story
