import React from 'react'
import styled from 'styled-components'

interface PurchaseTicketProps {
  onClick: () => void
}
export const PurchaseTicket = ({ onClick }: PurchaseTicketProps) => {
  return (
    <div>
      <Title>Purchase Ticket</Title>
      <PayButton onClick={onClick}>Pay &amp; Register for This Event</PayButton>
    </div>
  )
}

export default PurchaseTicket

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
const PayButton = styled.button`
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--green);
  color: var(--white);
  border: none;
  height: 60px;
  font-size: 16px;
  border-radius: 4px;
  transition: background-color 200ms ease;
  & :hover {
    background-color: var(--activegreen);
  }
  cursor: pointer;
  width: 100%;
`
