import { Select } from './Select'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  component: Select,
  title: 'Select',
} as ComponentMeta<typeof Select>

const Template: ComponentStory<typeof Select> = (args) => <Select {...args} />

export const SelectComponent = Template.bind({})

SelectComponent.args = {
  label: 'Select your option',
  options: [
    { label: 'Test 1', value: 1 },
    { label: 'Test 2', value: 2 },
  ],
}
