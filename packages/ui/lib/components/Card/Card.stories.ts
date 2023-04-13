import { Card } from './Card'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Card',
  component: Card,
  args: {},
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const CardPrimary = {
  args: {
    children: 'Card Primary',
  },
} satisfies Story

export const CardSecondary = {
  args: {
    children: 'Card Secondary',
    variant: 'secondary',
  },
} satisfies Story

export const CardDanger = {
  args: {
    children: 'Card Danger',
    variant: 'danger',
  },
} satisfies Story

export const CardWithShadow = {
  args: {
    children: 'Card with Shadow',
    variant: 'primary',
    shadow: 'lg',
  },
} satisfies Story
