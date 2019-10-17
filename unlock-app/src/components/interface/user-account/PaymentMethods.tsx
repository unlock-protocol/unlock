import React from 'react'
import { Grid, SectionHeader, Item, ItemValue } from './styles'

interface PaymentMethodProps {
  cards: stripe.Card[]
}

// TODO: Make this prettier
export const PaymentMethods = ({ cards }: PaymentMethodProps) => (
  <Grid>
    <SectionHeader>Payment Options</SectionHeader>
    {cards.map(({ id, brand, last4, exp_month, exp_year }) => (
      <Item key={id} size="full" title={`${brand} Card`}>
        <ItemValue>
          Ending in {last4} that expires on {exp_month}/{exp_year}
        </ItemValue>
      </Item>
    ))}
  </Grid>
)

export default PaymentMethods
