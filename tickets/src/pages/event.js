import React from 'react'
import EventContent from '../components/content/EventContent'
import GlobalErrorConsumer from '../components/interface/GlobalErrorConsumer'

const Event = () => {
  return (
    <GlobalErrorConsumer>
      <EventContent />
    </GlobalErrorConsumer>
  )
}

export default Event
