import React from 'react'
import { Card } from '@stripe/stripe-js'
import { Item } from './styles'

interface PaymentMethodProps {
  cards: Card[]
  deleteCard: () => void
}

// TODO: Make this prettier
export const PaymentMethods = ({ cards, deleteCard }: PaymentMethodProps) => (
  <div className="grid max-w-4xl gap-4 grid-cols-[repeat(12,[col-start]_1fr)">
    <h2 className="col-span-12 text-base font-bold leading-5">
      Payment Options
    </h2>
    {cards.map(({ id, brand, last4, exp_month, exp_year }) => (
      <Item key={id} count="full" title={`${brand} Card`}>
        <span className="flex h-5 mx-1 my-3 text-black">
          Ending in {last4} that expires on {exp_month}/{exp_year}.&nbsp;
          <button
            className="flex items-center p-2 border border-gray-100 rounded shadow opacity-90 hover:opacity-100 hover:border-gray-200"
            type="button"
            onClick={deleteCard}
          >
            Change
          </button>
        </span>
      </Item>
    ))}
  </div>
)

export default PaymentMethods
