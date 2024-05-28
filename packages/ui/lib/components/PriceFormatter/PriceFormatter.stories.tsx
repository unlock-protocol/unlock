import { Meta, StoryObj } from '@storybook/react'
import { PriceFormatter } from './PriceFormatter'

const meta = {
  component: PriceFormatter,
  title: 'PriceFormatter',
} satisfies Meta<typeof PriceFormatter>

export default meta
type Story = StoryObj<typeof meta>

export const DefaultPrice = {
  args: {
    price: '1.0',
  },
} satisfies Story

export const ZeroPrice = {
  args: {
    price: '0.0',
  },
} satisfies Story

export const SmallPrice1 = {
  args: {
    price: '0.000005',
  },
} satisfies Story

export const SmallPrice2 = {
  args: {
    price: '1.000005',
    precision: 3,
  },
} satisfies Story

export const BigPrice1 = {
  args: {
    price: '100500',
  },
} satisfies Story

export const BigPrice2 = {
  args: {
    price: '23476573',
    precision: 3,
  },
} satisfies Story

export const BigPricePrecision = {
  args: {
    price: '100500.1346',
  },
} satisfies Story

export const BigPricePrecision2 = {
  args: {
    price: '23476573.00006',
    precision: 3,
  },
} satisfies Story

export const BigPricePrecision3 = {
  args: {
    price: '23476573.2534700006',
    precision: 3,
  },
} satisfies Story

export const BigPricePrecision4 = {
  args: {
    price: '23476573.200006',
  },
} satisfies Story
