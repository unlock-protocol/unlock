import PropTypes from 'prop-types'
import React, { useContext, useState } from 'react'

import styled from 'styled-components'
import { AuthenticationContext } from '../../interface/Authenticate'
import UnlockPropTypes from '../../../propTypes'
import Svg from '../../interface/svg'
import Button from '../../interface/buttons/Button'
import { useAccount } from '../../../hooks/useAccount'

const CreditCardSettings = ({ lock, network }) => {
  // TODO: only allow for lock versions which support this
  // TODO: show indication that everything is set
  // TODO: add button to perform keyGranting transaction here as well
  const { account } = useContext(AuthenticationContext)
  const [error, setError] = useState('')

  const { connectStripeToLock } = useAccount(account, network)

  const connectStripe = async () => {
    setError('')
    const redirectUrl = await connectStripeToLock(
      lock.address,
      network,
      window.location.origin
    )
    if (!redirectUrl) {
      return setError(
        'We could not connect your lock to a Stripe account. Please try again later.'
      )
    }
    window.location.href = redirectUrl
  }

  return (
    <Wrapper>
      <Details>
        <DetailTitle>Credit Card</DetailTitle>
        <DetailBlock>
          <p>
            You can enable credit card payments for your lock by connecting it
            to a Stripe API key. This will enable users without crypto wallets,
            as well as users with wallets to pay using their credit cards!
          </p>
          <p>
            <button type="button" onClick={connectStripe}>
              Connect Stripe
            </button>
            {error && <Error>{error}</Error>}
          </p>
        </DetailBlock>
      </Details>
    </Wrapper>
  )
}

CreditCardSettings.propTypes = {
  network: PropTypes.number.isRequired,
  lock: UnlockPropTypes.lock.isRequired,
}

export default CreditCardSettings

const Wrapper = styled.section`
  padding-top: 20px;
  padding-left: 50px;
  padding-bottom: 50px;
`

const Details = styled.div`
  display: block;
  font-family: IBM Plex Sans;
`

const DetailTitle = styled.h3`
  color: var(--blue);
  margin-bottom: 0px;
  margin-top: 8px;
`

const DetailBlock = styled.div`
  display: flex;

  p {
    max-width: 400px;
    margin-right: 10px;
    margin-top: 8px;
  }
`
const Error = styled.p`
  color: var(--sharpred);
`
