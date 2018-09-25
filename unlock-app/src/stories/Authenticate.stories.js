import React from 'react'
import { storiesOf } from '@storybook/react'
import { Authenticate } from '../components/Authenticate'

let dummyFunction = () => {
  return false // We don't need this to do anything in the storybook context
}

storiesOf('Authenticate', Authenticate)
  .add('Default', () => {
    return (
      <Authenticate hideAccountPicker={dummyFunction} loadAccount={dummyFunction} />
    )
  })
