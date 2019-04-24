import React, { Fragment } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { Fieldset, Field, Label } from './CreateContent'
import { MONTH_NAMES } from '../../constants'
import UnlockPropTypes from '../../propTypes'
import BalanceProvider from '../helpers/BalanceProvider'

export const EventContent = ({ name, description, location, date, lock }) => {
  let dateString =
    MONTH_NAMES[date.getMonth()] +
    ' ' +
    date.getDate() +
    ', ' +
    date.getFullYear()

  return (
    <Fragment>
      <Title>{name}</Title>
      <DetailsFieldset>
        <Field>
          <Label>Ticket Price</Label>
          <BalanceProvider
            amount={lock.keyPrice}
            render={(ethWithPresentation, convertedUSDValue) => (
              <Price>
                <Eth>{ethWithPresentation} ETH</Eth>
                <Fiat>${convertedUSDValue}</Fiat>
              </Price>
            )}
          />
        </Field>
        <PayButton>Pay &amp; Register for This Event</PayButton>
      </DetailsFieldset>
      <DetailsFieldset>
        <DetailsField>
          <DisplayDate>{dateString}</DisplayDate>
          <Description>{description}</Description>
        </DetailsField>
        <Field>
          <Label>Location</Label>
          <Description>{location}</Description>
        </Field>
      </DetailsFieldset>
    </Fragment>
  )
}

EventContent.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  location: PropTypes.string,
  date: PropTypes.instanceOf(Date),
  lock: UnlockPropTypes.lock.isRequired,
}

EventContent.defaultProps = {
  name: 'Event',
  description: '',
  location: 'TBC',
  date: new Date(),
}

export default EventContent

const Title = styled.h1`
  font-family: 'IBM Plex Serif', serif;
  font-style: normal;
  font-weight: normal;
  font-size: 30px;
  line-height: normal;
  color: var(--dimgrey);
`

const Price = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 10px;
`

const Eth = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: bold;
  font-size: 30px;
  line-height: 39px;
  color: var(--dimgrey);
`

const Fiat = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 20px;
  line-height: 27px;
  text-align: right;
  color: var(--grey);
`

const PayButton = styled.div`
  background-color: var(--green);
  border: none;
  font-size: 16px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  transition: background-color 200ms ease;
  & :hover {
    background-color: var(--activegreen);
  }
  height: 60px;
  text-align: center;
  padding-top: 20px;
`

const DetailsFieldset = styled(Fieldset)`
  margin-bottom: 30px;
`

const DetailsField = styled(Field)`
  grid-template-rows: 35px auto;
`

const DisplayDate = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: var(--red);
`

const Description = styled.div`
  font-size: 20px;
  font-family: 'IBM Plex Serif', serif;
`
