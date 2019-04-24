import React from 'react'
import { storiesOf } from '@storybook/react'
import { TicketCode } from '../../components/content/purchase/TicketCode'

const config = {
  unlockTicketsUrl: 'https://tickets.unlock-protocol.com',
}

storiesOf('TicketCode')
  .add('Ticket code with signed address and public key', () => {
    return (
      <TicketCode
        signedAddress="this-is-a-signed-address"
        publicKey="12345"
        config={config}
      />
    )
  })
  .add('Ticket code with no signed address', () => {
    return <TicketCode publicKey="12345" config={config} />
  })
  .add('Ticket code with no public key', () => {
    return (
      <TicketCode signedAddress="https://unlock-protocol.com" config={config} />
    )
  })
  .add('Ticket code with no signed address or public key', () => {
    return <TicketCode config={config} />
  })
