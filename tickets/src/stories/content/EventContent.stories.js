import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import { EventContent } from '../../components/content/EventContent'

import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({})

storiesOf('Event RSVP page', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Event RSVP page', () => {
    const date = new Date(2063, 10, 23)
    const name = 'My Doctor Who party'
    const description = `Unbelievably, it's been 100 years since it first came to our screens.
    
Join us for an hour or two of fine entertainment.`
    const location = 'Totters Lane, London'
    const lock = {
      keyPrice: '0.01',
      expirationDuration: 172800,
      maxNumberOfKeys: 240,
      outstandingKeys: 3,
      address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      transaction: 'deployedid',
    }

    return (
      <EventContent
        date={date}
        name={name}
        description={description}
        location={location}
        lock={lock}
      />
    )
  })
