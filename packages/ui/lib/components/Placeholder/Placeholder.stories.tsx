import { Placeholder } from '.'
import { ComponentStory } from '@storybook/react'

export default {
  component: Placeholder,
  title: 'Placeholder',
}

const Template: ComponentStory<any> = (args) => (
  <Placeholder.Root>
    <Placeholder.Image rounded="full" size="sm" />
    <Placeholder.Line />
    <Placeholder.Line />
    <Placeholder.Line />
  </Placeholder.Root>
)

export const Profile = Template.bind({})
