import { Modal } from './Modal'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Modal,
  title: 'Modal',
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Primary = {
  args: {
    isOpen: true,
    setIsOpen: () => {},
    children: <p> Hello, this is modal! </p>,
  },
} satisfies Story
