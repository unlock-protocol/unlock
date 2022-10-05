import React from 'react'
import styled from 'styled-components'

interface SwitchPaymentProps {
  paymentOptions: string[]
  activePayment: string | null
  setActivePayment: (option: string) => void
}

export const SwitchPayment = ({
  paymentOptions,
  activePayment,
  setActivePayment,
}: SwitchPaymentProps) => {
  return (
    <div className="w-60">
      <div className="grid grid-cols-2 mt-4">
        <Header>Switch payment to</Header>
        <ResetText onClick={() => setActivePayment('Default')}>reset</ResetText>
      </div>
      {paymentOptions.map((option) => {
        if (option === activePayment) {
          return (
            <ActivePaymentOption data-testid={`active-${option}`} key={option}>
              {option}
            </ActivePaymentOption>
          )
        }
        return (
          <PaymentOption onClick={() => setActivePayment(option)} key={option}>
            {option}
          </PaymentOption>
        )
      })}
    </div>
  )
}

const Header = styled.span`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 17px;
  color: var(--darkgrey);
`

const ResetText = styled(Header)`
  color: var(--link);
  cursor: pointer;
  width: 100%;
  text-align: right;
`

const PaymentOption = styled.button`
  padding: 8px;
  margin: 4px 4px 0 0;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  background: var(--white);
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  color: var(--link);
  border: none;
  cursor: pointer;
`

const ActivePaymentOption = styled(PaymentOption)`
  color: var(--white);
  background: var(--link);
`
