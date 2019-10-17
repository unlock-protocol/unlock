import React from 'react'
import styled from 'styled-components'
import BalanceProvider from '../helpers/BalanceProvider'

interface PurchaseTicketProps {
  onClick: () => void
  keyPrice?: string
}
export const PurchaseTicket = ({ onClick, keyPrice }: PurchaseTicketProps) => {
  // The price rendering is vestigial -- this should come from the paywall
  const currency = 'Eth'
  const convertCurrency = true
  return (
    <div>
      {keyPrice && (
        <BalanceProvider
          amount={keyPrice}
          render={(ethWithPresentation: string, convertedUSDValue: string) => (
            <Price>
              <Eth>
                {ethWithPresentation} {currency}
              </Eth>
              {convertCurrency && <Fiat>${convertedUSDValue}</Fiat>}
            </Price>
          )}
        />
      )}
      <PayButton onClick={onClick}>Pay &amp; Register for This Event</PayButton>
    </div>
  )
}

export default PurchaseTicket

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

const Price = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
`

const Eth = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: bold;
  font-size: 30px;
  color: var(--dimgrey);
`

const Fiat = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 20px;
  text-align: left;
  color: var(--grey);
`
