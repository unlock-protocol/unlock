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
    <Container>
      <Header>Switch payment to</Header>
      {paymentOptions.map(option => {
        if (option === activePayment) {
          return (
            <ActivePaymentOption key={option}>{option}</ActivePaymentOption>
          )
        }
        return (
          <PaymentOption
            type="button"
            onClick={() => setActivePayment(option)}
            key={option}
          >
            {option}
          </PaymentOption>
        )
      })}
    </Container>
  )
}

const Container = styled.div`
  width: 240px;
`

const Header = styled.h4`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 17px;
  color: var(--darkgrey);
`

const PaymentOption = styled.button`
  padding: 8px;
  margin: 4px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  background: var(--white);
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  color: var(--link);
  border: none;
`

const ActivePaymentOption = styled(PaymentOption)`
  color: var(--white);
  background: var(--link);
`
