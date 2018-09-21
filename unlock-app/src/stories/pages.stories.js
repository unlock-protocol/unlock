import React from 'react'
import { storiesOf } from '@storybook/react'
import About from '../components/pages/About'
import Jobs from '../components/pages/Jobs'

storiesOf('Content pages')
  .add('the About page', () => {
    return (
      <About />
    )
  })
  .add('the Jobs page', () => {
    return (
      <Jobs />
    )
  })
