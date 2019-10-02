import React from 'react'
import styled from 'styled-components'
import { MONTH_NAMES } from '../../constants'
import { getTimeString } from '../../utils/dates'
import { Title, Date as DateComponent, Time, Location } from './EventStyles'

export const EventInfo = ({ event }: any) => {
  return (
    <div>
      {event.image && <Banner src={event.image} />}
      <Title>{event.name}</Title>
      {event.name === 'EthWaterloo' ? (
        <DateComponent>November 8 - 10, 2019</DateComponent>
      ) : (
        <EventDate date={event.date} duration={6400} />
      )}
      <Location>{event.location}</Location>
    </div>
  )
}

function EventDate({ date, duration }: any) {
  if (!date) {
    return <></>
  }
  const dateString =
    MONTH_NAMES[date.getMonth()] +
    ' ' +
    date.getDate() +
    ', ' +
    date.getFullYear()

  let timeString = getTimeString(date)
  if (duration) {
    const endDate = new Date(date.getTime() + duration * 1000)
    timeString += ' - ' + getTimeString(endDate)
  }

  return (
    <DateComponent>
      {dateString}
      <Time>{timeString}</Time>
    </DateComponent>
  )
}

const Banner = styled.img`
  max-width: 100%;
`

export default EventInfo
