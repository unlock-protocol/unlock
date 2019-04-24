import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import { EventContent } from '../../../components/content/EventContent'
import { MONTH_NAMES } from '../../../constants'
import createUnlockStore from '../../../createUnlockStore'

const store = createUnlockStore({})

describe('EventContent', () => {
  it('should display an event when given appropriate properties', () => {
    expect.assertions(3)
    const lock = {
      keyPrice: '0.01',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: 'deployedid',
    }

    const date = new Date(2063, 10, 23)
    const name = 'My Doctor Who party'
    const description = `Unbelievably, it's been 100 years since it first came to our screens.
    
Join us for an hour or two of fine entertainment.`
    const location = 'Totters Lane, London'

    const wrapper = rtl.render(
      <Provider store={store}>
        <EventContent
          date={date}
          name={name}
          description={description}
          location={location}
          lock={lock}
        />
      </Provider>
    )

    expect(wrapper.getByText(name)).not.toBeNull()
    expect(wrapper.getByText(location)).not.toBeNull()
    const dateString =
      MONTH_NAMES[date.getMonth()] +
      ' ' +
      date.getDate() +
      ', ' +
      date.getFullYear()
    expect(wrapper.getByText(dateString)).not.toBeNull()
  })
})
