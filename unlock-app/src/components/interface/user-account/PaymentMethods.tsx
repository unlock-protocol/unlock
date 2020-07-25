import React from 'react'
import { Card } from '@stripe/stripe-js'
import { Grid, SectionHeader, Item, ItemValue } from './styles'

interface PaymentMethodProps {
  cards: Card[]
  deleteCard: () => void
}

// TODO: Make this prettier
export const PaymentMethods = ({ cards, deleteCard }: PaymentMethodProps) => (
  <Grid>
    <SectionHeader>Payment Options</SectionHeader>
    {cards.map(({ id, brand, last4, exp_month, exp_year }) => (
      <Item key={id} count="full" title={`${brand} Card`}>
        <ItemValue>
          Ending in {last4} that expires on {exp_month}/{exp_year}.{' '}
          <button type="button" onClick={deleteCard}>
            Change
          </button>
        </ItemValue>
      </Item>
    ))}
  </Grid>
)

export default PaymentMethods
