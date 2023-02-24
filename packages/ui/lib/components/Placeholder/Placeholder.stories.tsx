import { Placeholder } from '.'
import { StoryFn } from '@storybook/react'

const meta = {
  component: Placeholder,
  title: 'Placeholder',
}

export default meta

export const Template: StoryFn<typeof meta> = (args) => (
  <Placeholder.Root>
    <Placeholder.Image rounded="full" size="sm" />
    <Placeholder.Line />
    <Placeholder.Line />
    <Placeholder.Line />
  </Placeholder.Root>
)
