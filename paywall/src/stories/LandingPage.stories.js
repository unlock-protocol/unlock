import React from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import { storiesOf } from '@storybook/react'
import LandingPage from '../components/LandingPage'

storiesOf('Landing Page', module).add('The Landing Page', () => {
  return <LandingPage />
})
