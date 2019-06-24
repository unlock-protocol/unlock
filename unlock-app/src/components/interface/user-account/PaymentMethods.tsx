import React from 'react'
import { connect } from 'react-redux'
import { Grid, SectionHeader, Item, ItemValue } from './styles'

interface StripeCard {
  id: string
  brand: string
  exp_month: number
  exp_year: number
  last4: string
}

interface PaymentMethodProps {
  cards: StripeCard[]
}

// TODO: Swap between this component and the add payment method component
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

interface ReduxState {
  account: {
    cards?: StripeCard[]
  }
}

export const mapStateToProps = ({ account }: ReduxState) => {
  let cards: StripeCard[] = []
  if (account.cards) {
    cards = account.cards
  }

  return {
    cards,
  }
}

export default connect(mapStateToProps)(PaymentMethods)
