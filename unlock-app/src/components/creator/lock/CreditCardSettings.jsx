import PropTypes from 'prop-types'
import React, { useContext, useState, useEffect } from 'react'

import styled from 'styled-components'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'

import UnlockPropTypes from '../../../propTypes'
import Svg from '../../interface/svg'
import Button from '../../interface/buttons/Button'
import { useAccount } from '../../../hooks/useAccount'
import ConnectCard from '../ConnectCard'
import useLock from '../../../hooks/useLock'

const CreditCardSettings = ({ lock: lockFromProps, network }) => {
  const { lock, getCreditCardPricing } = useLock(lockFromProps, network)
  const [fiatPricing, setFiatPricing] = useState(null)

  useEffect(async () => {
    setFiatPricing(await getCreditCardPricing())
  }, [lock.address])
  return (
    <div className="pt-5 pl-12 pb-14">
      <Details>
        <DetailTitle>Credit Card</DetailTitle>
        <div className="flex">
          <Text>
            We are using Stripe to enable credit card payments on your lock. The
            funds are directly accessible for you on Stripe and do not transit
            through Unlock.
            {fiatPricing?.usd?.keyPrice < 50 && (
              <Error>
                <br />
                Your current price is too low for us to process credit cards. It
                needs to be at least $0.50.
              </Error>
            )}
          </Text>
          <ConnectCard lock={lock} lockNetwork={network} />
        </div>
      </Details>
    </div>
  )
}

CreditCardSettings.propTypes = {
  network: PropTypes.number.isRequired,
  lock: UnlockPropTypes.lock.isRequired,
}

export default CreditCardSettings

const Details = styled.div`
  display: block;
  font-family: IBM Plex Sans;
`

const DetailTitle = styled.h3`
  color: var(--blue);
  margin-bottom: 0px;
  margin-top: 8px;
`

const Text = styled.p`
  font-size: 16px;
  max-width: 400px;
  margin-right: 10px;
  margin-top: 8px;
`

const Error = styled.span`
  color: var(--sharpred);
`
