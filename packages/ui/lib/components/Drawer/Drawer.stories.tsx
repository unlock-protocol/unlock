import { Drawer } from './Drawer'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Button } from '../Button/Button'

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
  description: 'This is a primary drawer.',
  children: (
    <div className="space-y-2">
      <p> This is a drawer. </p>
      <Button> Confirm </Button>
    </div>
  ),
}
