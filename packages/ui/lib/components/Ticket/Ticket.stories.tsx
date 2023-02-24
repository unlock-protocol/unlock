import { Ticket } from './Ticket'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Ticket,
  title: 'Ticket',
} satisfies Meta<typeof Ticket>

export default meta
type Story = StoryObj<typeof meta>

export const TicketComponent = {
  args: {
    iconURL: '/images/lock.png',
    title: 'A Huge event in NYC',
    id: '1',
    recipient: '0xC8BD5B876E9c06F30b8f0E79aB25A3aEa7F47D97',
    lockAddress: '0xC8BD5B876E9c06F30b8f0E79aB25A3aEa7F47D97',
    network: 1,
    time: '10:00 - 12:00',
    date: '10/10/2022 - 10/15/2022',
    location: '190 Bowery, Soho, New York',
    QRCodeURL: '/images/qrcode.png',
  },
} satisfies Story

export const TicketComponentWithENS = {
  args: {
    iconURL: '/images/lock.png',
    title: 'A Huge event in NYC',
    id: '1',
    recipient: 'julien51.eth',
    lockAddress: '0xC8BD5B876E9c06F30b8f0E79aB25A3aEa7F47D97',
    network: 100,
    time: '10:00 - 12:00',
    date: '10/10/2022 - 10/15/2022',
    location: '190 Bowery, Soho, New York',
    QRCodeURL: '/images/qrcode.png',
  },
} satisfies Story

export const TicketComponentWithEmail = {
  args: {
    iconURL: '/images/lock.png',
    title: 'A Huge event in NYC',
    id: '1',
    recipient: 'julien51.eth',
    lockAddress: '0xC8BD5B876E9c06F30b8f0E79aB25A3aEa7F47D97',
    network: 100,
    time: '10:00 - 12:00',
    location: '190 Bowery, Soho, New York',
    QRCodeURL: '/images/qrcode.png',
    email: 'team@unlock-protocol.com',
  },
} satisfies Story
