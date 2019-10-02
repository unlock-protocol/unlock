import React from 'react'
import * as rtl from 'react-testing-library'
import { EventInfo } from '../../../components/interface/EventInfo'

const getTimezoneOffset = Date.prototype.getTimezoneOffset

Date.prototype.getTimezoneOffset = function() {
  // These tests will always be EST
  return 240
}

describe('EventInfo component', () => {
  it('should render the time for an event', () => {
    expect.assertions(0)

    const event = {
      name: 'A fun event',
      date: new Date('2019-10-02T18:31:06.623Z'),
    }

    const { getByText } = rtl.render(<EventInfo event={event} />)

    getByText('A fun event')
    getByText('Oct 2, 2019')
    getByText('2:31pm')
  })

  it('should render the time for an event with a duration', () => {
    expect.assertions(0)

    const event = {
      name: 'A fun event',
      date: new Date('2019-10-02T18:31:06.623Z'),
      duration: 6400,
    }

    const { getByText } = rtl.render(<EventInfo event={event} />)

    getByText('A fun event')
    getByText('Oct 2, 2019')
    getByText('2:31pm - 4:17pm')
  })

  it('should also handle events with no date', () => {
    expect.assertions(0)

    const event = {
      name: 'A fun event',
    }

    const { getByText } = rtl.render(<EventInfo event={event} />)

    // No date/time shown, just title of event
    getByText('A fun event')
  })

  it('should handle the hardcoded event date for EthWaterloo', () => {
    expect.assertions(0)

    const event = {
      name: 'EthWaterloo',
      // Rendered date will not match this
      date: new Date('2019-10-02T18:31:06.623Z'),
    }

    const { getByText } = rtl.render(<EventInfo event={event} />)

    getByText('EthWaterloo')
    getByText('Nov 8 - 10, 2019')
  })
})

Date.prototype.getTimezoneOffset = getTimezoneOffset
