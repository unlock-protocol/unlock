import { Box } from './Box'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Button } from '../Button/Button'

export default {
  component: Box,
  title: 'Box',
} as ComponentMeta<typeof Box>

const Template: ComponentStory<typeof Box> = (args) => <Box {...args} />

export const BoxAsButton = Template.bind({})

BoxAsButton.args = {
  children: 'Connect',
  as: Button,
}
