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
          Ending in {last4} that expires on {exp_month}/{exp_year}.&nbsp;
          <button
            className="flex items-center p-2 border border-gray-100 rounded shadow opacity-90 hover:opacity-100 hover:border-gray-200"
            type="button"
            onClick={deleteCard}
          >
            Change
          </button>
        </ItemValue>
      </Item>
    ))}
  </Grid>
)

export default PaymentMethods
