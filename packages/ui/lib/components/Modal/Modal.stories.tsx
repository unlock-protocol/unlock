import { Modal } from './Modal'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  component: Modal,
  title: 'Modal',
} as ComponentMeta<typeof Modal>

const Template: ComponentStory<typeof Modal> = (args) => <Modal {...args} />

export const Primary = Template.bind({})

Primary.args = {
  isOpen: true,
  setIsOpen: () => {},
  children: <div className="flex p-4"> Hello, this is modal! </div>,
}
