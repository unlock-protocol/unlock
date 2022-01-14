import { IconButton } from './IconButton'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { AiOutlineClose as CloseIcon, AiOutlinePlus as PlusIcon } from 'react-icons/ai'

export default {
  component: IconButton,
  title: 'IconButton',
} as ComponentMeta<typeof IconButton>

const Template: ComponentStory<typeof IconButton> = (args) => (
  <IconButton {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  icon: <CloseIcon />,
  label: "Close",
  size: "medium"
}

export const Secondary = Template.bind({})

Secondary.args = {
    icon: <PlusIcon size={20} />,
    label: "Create",
    size: "large"
}