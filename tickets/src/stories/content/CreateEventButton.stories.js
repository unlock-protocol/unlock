import React from 'react'
import { storiesOf } from '@storybook/react'
import { CreateEventButton } from '../../components/content/create/CreateEventButton'

storiesOf('CreateEventButton', module)
  .add('Default', () => {
    return <CreateEventButton />
  })
  .add('Submitted', () => {
    return <CreateEventButton submitted />
  })
