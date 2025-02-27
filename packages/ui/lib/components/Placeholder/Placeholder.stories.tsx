import React from 'react'
import { Placeholder } from '.'
import type { Meta, StoryObj } from '@storybook/react'

const PlaceholderRoot = Placeholder.Root as React.FC<any>

// Define the meta with the explicit component type
const meta = {
  title: 'Placeholder',
  component: PlaceholderRoot,
} as Meta<typeof PlaceholderRoot>

export default meta

type Story = StoryObj<typeof meta>

// Create a basic template story
export const Default: Story = {
  render: () => (
    <Placeholder.Root>
      <Placeholder.Image rounded="full" size="sm" />
      <Placeholder.Line />
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder.Root>
  ),
}

// Create a story with inline placeholder
export const Inline: Story = {
  render: () => (
    <Placeholder.Root inline={true}>
      <Placeholder.Image rounded="full" size="sm" />
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder.Root>
  ),
}

// Card placeholder example
export const Cards: Story = {
  render: () => (
    <Placeholder.Root>
      <Placeholder.Card size="sm" />
      <Placeholder.Card size="md" />
    </Placeholder.Root>
  ),
}
