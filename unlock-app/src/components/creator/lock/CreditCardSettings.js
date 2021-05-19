import PropTypes from 'prop-types'
import React, { useContext, useState } from 'react'

import styled from 'styled-components'
import { AuthenticationContext } from '../../interface/Authenticate'
import UnlockPropTypes from '../../../propTypes'
import Svg from '../../interface/svg'
import Button from '../../interface/buttons/Button'
import { useAccount } from '../../../hooks/useAccount'
import ConnectCard from '../ConnectCard'

const CreditCardSettings = ({ lock, network }) => {
  // TODO: only allow for lock versions which support this

  return (
    <Wrapper>
      <Details>
        <DetailTitle>Credit Card</DetailTitle>
        <DetailBlock>
          <Text>
            We are using Stripe to enable credit card payments on your lock. The
            funds are directly accessible for you on Stripe and do not transit
            through Unlock. We do not have any other administrative right on
            your lock (we cannot access your funds).
          </Text>
          <ConnectCard lockAddress={lock.address} lockNetwork={network} />
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
`

const Text = styled.p`
  font-size: 16px;
  max-width: 400px;
  margin-right: 10px;
  margin-top: 8px;
`

const Error = styled.p`
  color: var(--sharpred);
`
