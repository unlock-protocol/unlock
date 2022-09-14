import { Collapse } from './Collapse'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  component: Collapse,
  title: 'Collapse',
} as ComponentMeta<typeof Collapse>

const Template: ComponentStory<typeof Collapse> = (args) => (
  <Collapse {...args} />
)

export const CollapseDefault = Template.bind({})

CollapseDefault.args = {
  children: <span>Children content</span>,
  content: (
    <div className="flex justify-between">
      <span>1</span>
      <span>2</span>
      <span>3</span>
    </div>
  ),
  disabled: false,
}

export const CollapseDisabled = Template.bind({})

CollapseDisabled.args = {
  children: <span>Children content</span>,
  content: (
    <div className="flex justify-between">
      <span>1</span>
      <span>2</span>
      <span>3</span>
    </div>
  ),
  disabled: true,
}

export const CollapseOpen = Template.bind({})

CollapseOpen.args = {
  children: <span>Children content</span>,
  content: (
    <div className="flex justify-between">
      <span>1</span>
      <span>2</span>
      <span>3</span>
    </div>
  ),
  disabled: true,
  collapsed: true,
}
