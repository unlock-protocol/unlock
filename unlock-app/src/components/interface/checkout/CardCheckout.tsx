import React, { useEffect, useContext, useState } from 'react'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import { useAccount } from '../../../hooks/useAccount'
import { PaymentDetails } from '../user-account/PaymentDetails'
import Loading from '../Loading'

interface CardCheckoutProps {
  network: number
  handleCard: (card: any, token?: string) => void
}

export const CardCheckout = ({ network, handleCard }: CardCheckoutProps) => {
  const { account } = useContext(AuthenticationContext)
  // @ts-expect-error account is _always_ defined in this component
  const { getCards } = useAccount(account, network)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const retrieveCards = async () => {
      const cards = await getCards()
      if (cards[0]) {
        handleCard(cards[0])
      } else {
        setLoading(false)
      }
    }

    if (account) {
      retrieveCards()
    }
  }, [account])

  const saveCard = (token: string, card: any) => {
    handleCard(card, token)
  }

  return (
    <div className="flex flex-col w-full">
      {loading && <Loading />}

      {!loading && <PaymentDetails saveCard={saveCard} />}
    </div>
  )
}

export default CardCheckout
