import { Drawer } from './Drawer'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  component: Drawer,
  title: 'Drawer',
} as ComponentMeta<typeof Drawer>

const Template: ComponentStory<typeof Drawer> = (args) => <Drawer {...args} />

export const Primary = Template.bind({})

Primary.args = {
  isOpen: true,
  setIsOpen: () => {},
  title: 'Primary Drawer',
  children: <p> This is primary drawer </p>,
}
