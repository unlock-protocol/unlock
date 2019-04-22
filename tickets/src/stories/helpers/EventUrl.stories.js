import React from 'react'
import { storiesOf } from '@storybook/react'
import { EventUrl } from '../../components/helpers/EventUrl'

storiesOf('Event URL helper', module)
  .add('Event URL with address', () => {
    return <EventUrl address="0x123" />
  })
  .add('Event URL with no address', () => {
    return <EventUrl address={null} />
  })
