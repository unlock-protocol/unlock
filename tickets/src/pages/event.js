import React from 'react'

import EventContent from '../components/content/EventContent'

const Event = ({ event }) => {
  return <EventContent lock={lock} />
}

Event.getInitialProps = async context => {}

export default Event
