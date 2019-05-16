import React from 'react'
import { storiesOf } from '@storybook/react'
import { ValidationIcon } from '../../components/content/validate/ValidationIcon'

storiesOf('Event validation icon', module)
  .add('Ticket valid', () => {
    return <ValidationIcon valid verifySignedAddress={() => {}} />
  })
  .add('Ticket invalid', () => {
    return <ValidationIcon valid={false} verifySignedAddress={() => {}} />
  })
  .add('Ticket validating', () => {
    return <ValidationIcon valid={null} verifySignedAddress={() => {}} />
  })
