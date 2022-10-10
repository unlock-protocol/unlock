import { Ticket, TicketItem } from './Ticket'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { RiMailFill as MailIcon } from 'react-icons/ri'

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
  recipient: '0xC8BD5B876E9c06F30b8f0E79aB25A3aEa7F47D97',
  lockAddress: '0xC8BD5B876E9c06F30b8f0E79aB25A3aEa7F47D97',
  network: 1,
  items: [],
  time: '10:00 - 12:00',
  date: '10/10/2022 - 10/15/2022',
  location: '190 Bowery, Soho, New York',
  QRCodeURL: '/images/qrcode.png',
}

export const TicketComponentWithENS = Template.bind({})

TicketComponentWithENS.args = {
  iconURL: '/images/lock.png',
  title: 'A Huge event in NYC',
  id: '1',
  recipient: 'julien51.eth',
  lockAddress: '0xC8BD5B876E9c06F30b8f0E79aB25A3aEa7F47D97',
  network: 100,
  items: [],
  time: '10:00 - 12:00',
  date: '10/10/2022 - 10/15/2022',
  location: '190 Bowery, Soho, New York',
  QRCodeURL: '/images/qrcode.png',
}

export const TicketComponentWithEmail = Template.bind({})

TicketComponentWithEmail.args = {
  iconURL: '/images/lock.png',
  title: 'A Huge event in NYC',
  id: '1',
  recipient: 'julien51.eth',
  lockAddress: '0xC8BD5B876E9c06F30b8f0E79aB25A3aEa7F47D97',
  network: 100,
  items: [
    <TicketItem icon={<MailIcon />} value="julien@unlock-protocol.com" />,
  ],
  time: '10:00 - 12:00',
  location: '190 Bowery, Soho, New York',
  QRCodeURL: '/images/qrcode.png',
}
