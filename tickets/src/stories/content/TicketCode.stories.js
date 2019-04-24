import React from 'react'
import { storiesOf } from '@storybook/react'
import { TicketCode } from '../../components/content/purchase/TicketCode'

storiesOf('TicketCode')
  .add('Ticket code with signed address and public key', () => {
    return (
      <TicketCode
        signedAddress="https://unlock-protocol.com"
        publicKey="12345"
      />
    )
  })
  .add('Ticket code with no signed address', () => {
    return <TicketCode publicKey="12345" />
  })
  .add('Ticket code with no public key', () => {
    return <TicketCode signedAddress="https://unlock-protocol.com" />
  })
  .add('Ticket code with no signed address or public key', () => {
    return <TicketCode />
  })
