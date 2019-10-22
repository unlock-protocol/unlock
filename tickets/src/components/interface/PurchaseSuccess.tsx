import React from 'react'
import styled from 'styled-components'
import Svg from './svg'

interface Props {
  unlockAppUrl: string
}

export const PurchaseSuccess = ({ unlockAppUrl }: Props) => {
  const keychainURL = `${unlockAppUrl}/keychain`

  return (
    <div>
      <Title>Your Ticket</Title>
      <TicketLink
        href={keychainURL}
        target="_blank"
        rel="noopener noreferrer"
        type="button"
      >
        Get Ticket QR Code <Svg.Qr fill="white" />
      </TicketLink>
      <p>Get your event&apos;s QR code ticket from the Unlock Keychain.</p>
      <p>
        You&apos;ll use this QR code at the event to verify that you bought a
        ticket. You can have the QR code emailed to you or create it on demand,
        in which case you should make sure to have a device with you that can
        access the Keychain.
      </p>
    </div>
  )
}

export default PurchaseSuccess

const Title = styled.h2`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;

  /* identical to box height */
  display: flex;
  align-items: center;
  letter-spacing: 1px;
  text-transform: uppercase;

  color: #4a4a4a;
`

const TicketLink = styled.a`
  display: flex;
  flex-direction: row;
  border-radius: 4px;
  height: 60px;
  color: var(--white);
  background-color: #4d8be8;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 21px;
  align-items: center;
  justify-content: center;
  & > svg {
    width: 32px;
    margin-left: 32px;
  }
`
