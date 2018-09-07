import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import createUnlockStore from '../../createUnlockStore'
import LockMakerForm from '../../components/creator/LockMakerForm'

let store = createUnlockStore()

storiesOf('LockMakerForm')
.addDecorator(story => <Provider store={store}>{story()}</Provider>)
.add('Default settings', () => {
  return (
    <LockMakerForm />
  )
})
