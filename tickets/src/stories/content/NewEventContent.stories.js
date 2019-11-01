import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import { EventContentBody } from '../../components/content/NewEventContent'
import Layout from '../../components/interface/Layout'

import createUnlockStore from '../../createUnlockStore'
import configure from '../../config'
import { ConfigContext } from '../../utils/withConfig'

const store = createUnlockStore({})

const ConfigProvider = ConfigContext.Provider

const config = configure()

const event = {
  date: new Date(2063, 10, 23, 18, 30),
  name: 'My Doctor Who party',
  description: `Unbelievably, it's been 100 years since it first came to our screens.

Join us for an hour or two of fine entertainment.`,
  location: 'Totters Lane, London',
  duration: 3600,
  links: [
    {
      href: 'https://party.com/fun',
      text: 'Event Website',
    },
  ],
}

storiesOf('New Event RSVP page', module)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Event RSVP page with an unknown status (loading)', () => {
    return (
      <ConfigProvider value={config}>
        <Layout>
          <EventContentBody event={event} config={config} />
        </Layout>
      </ConfigProvider>
    )
  })
  .add('Event RSVP page with a valid key (unlocked)', () => {
    return (
      <ConfigProvider value={config}>
        <Layout>
          <EventContentBody
            event={event}
            config={config}
            paywallStatus="unlocked"
          />
        </Layout>
      </ConfigProvider>
    )
  })
  .add('Event RSVP page without a valid key (locked)', () => {
    return (
      <ConfigProvider value={config}>
        <Layout>
          <EventContentBody
            event={event}
            config={config}
            paywallStatus="locked"
          />
        </Layout>
      </ConfigProvider>
    )
  })
