import React from 'react'
import * as rtl from 'react-testing-library'
import { EventUrl } from '../../../components/helpers/EventUrl'

describe('EventUrl helper component', () => {
  it('shows an event URL when an address is supplied', () => {
    expect.assertions(1)
    const wrapper = rtl.render(<EventUrl address="0x123" />)
    expect(
      wrapper.queryByText('https://tickets.unlock-protocol.com/event/0x123')
    ).not.toBeNull()
  })
  it('shows a placeholder when no address has been supplied', () => {
    expect.assertions(1)
    const wrapper = rtl.render(<EventUrl address={null} />)
    expect(wrapper.queryByText('...')).not.toBeNull()
  })
})
