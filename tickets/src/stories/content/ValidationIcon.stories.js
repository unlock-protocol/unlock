import React from 'react'
import { storiesOf } from '@storybook/react'
import { ValidationIcon } from '../../components/content/validate/ValidationIcon'

storiesOf('Event validation icon', module)
  .add('Ticket valid', () => {
    return <ValidationIcon valid />
  })
  .add('Ticket invalid', () => {
    return <ValidationIcon valid={false} />
  })
  .add('Ticket validating', () => {
    return <ValidationIcon valid={null} />
  })
