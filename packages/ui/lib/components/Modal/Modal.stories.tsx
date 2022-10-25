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
  children: <p> Hello, this is modal! </p>,
}
