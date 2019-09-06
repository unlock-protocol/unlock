import React from 'react'
import styled from 'styled-components'
import Svg from '../svg'

interface LockInfoProps {
  priceBreakdown: { [key: string]: string }
  timeRemaining: any
}

const LockInfo = ({ priceBreakdown, timeRemaining }: LockInfoProps) => {
  const {
    total,
    unlockServiceFee,
    keyPrice,
    creditCardProcessing,
  } = priceBreakdown

  // `total` is always a member of the price breakdown when we actually have
  // prices. If `total` isn't present, we know to show the loading spinner until it
  // is.
  if (!total) {
    return (
      <LockInfoWrapper>
        <Svg.Loading />
      </LockInfoWrapper>
    )
  }

  return (
    <LockInfoWrapper>
      <div>
        <TimeRemaining>{timeRemaining}</TimeRemaining>
        <TotalPrice>{total}</TotalPrice>
      </div>
      <Breakdown>
        {`The total price includes the base key price of ${keyPrice}, credit card processing fee of ${creditCardProcessing}, and the Unlock service fee of ${unlockServiceFee}.`}
      </Breakdown>
    </LockInfoWrapper>
  )
}

const LockInfoWrapper = styled.div`
  margin-top: 8px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  svg {
    width: 48px;
    fill: var(--grey);
    margin: 0 auto;
  }
`

export const TimeRemaining = styled.span`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 30px;
  line-height: 39px;
  color: var(--slate);
  float: left;
`

export const Breakdown = styled.p`
  font-size: 14px;
  line-height: 20px;
`

export const TotalPrice = styled(TimeRemaining)`
  float: right;
`

export default LockInfo
