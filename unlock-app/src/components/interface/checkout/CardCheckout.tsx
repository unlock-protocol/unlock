import React, { useEffect, useContext, useState } from 'react'
import styled from 'styled-components'
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
    <Wrapper>
      {loading && <Loading />}

      {!loading && <PaymentDetails saveCard={saveCard} />}
    </Wrapper>
  )
}

export default CardCheckout

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const CardNumber = styled.p`
  text-align: center;
  color: var(--grey);
`
