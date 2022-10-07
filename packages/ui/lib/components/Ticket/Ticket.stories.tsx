import { Ticket } from './Ticket'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  component: Ticket,
  title: 'Ticket',
} as ComponentMeta<typeof Ticket>

const Template: ComponentStory<typeof Ticket> = (args) => <Ticket {...args} />

export const TicketComponent = Template.bind({})

TicketComponent.args = {
  iconURL: '/images/lock.png',
  title: 'A Huge event in NYC',
  id: '1',
  recipient: '0x1213...14141',
  items: [],
  time: '10:00 - 12:00',
  date: '10/10/2022 - 10/15/2022',
  location: '190 Bowery, Soho, New York',
  QRCodeURL: '/images/qrcode.png',
}
