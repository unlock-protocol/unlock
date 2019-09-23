import React from 'react'
import NewEventContent from '../components/content/NewEventContent'
import GlobalErrorConsumer from '../components/interface/GlobalErrorConsumer'

const NewEvent = () => {
  return (
    <GlobalErrorConsumer>
      <NewEventContent />
    </GlobalErrorConsumer>
  )
}

export default NewEvent
