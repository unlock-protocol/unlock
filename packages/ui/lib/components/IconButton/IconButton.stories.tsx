import { IconButton } from './IconButton'
import { Meta, StoryObj } from '@storybook/react'
import {
  AiOutlineClose as CloseIcon,
  AiOutlinePlus as PlusIcon,
} from 'react-icons/ai'

const meta = {
  component: IconButton,
  title: 'IconButton',
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary = {
  args: {
    icon: <CloseIcon />,
    label: 'Close',
    size: 'medium',
  },
} satisfies Story

export const Secondary = {
  args: {
    icon: <PlusIcon size={20} />,
    label: 'Create',
    size: 'large',
  },
} satisfies Story
