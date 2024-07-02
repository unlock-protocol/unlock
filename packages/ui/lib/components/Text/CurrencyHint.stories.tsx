import { Meta, StoryObj } from '@storybook/react/*'
import { CurrencyHint } from './CurrencyHint'

const meta = {
  component: CurrencyHint,
  title: 'Currency Hint',
} satisfies Meta<typeof CurrencyHint>

export default meta
type Story = StoryObj<typeof meta>

export const SelectComponent = {
  args: {
    network: 'Ethereum',
  },
}
