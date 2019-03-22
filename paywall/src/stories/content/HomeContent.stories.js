import React from 'react'
import { storiesOf } from '@storybook/react'
import HomeContent from '../../components/content/HomeContent'

storiesOf('Paywall landing page', module).add('Landing page', () => {
  return <HomeContent path="/" />
})
