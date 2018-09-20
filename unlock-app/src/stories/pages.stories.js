import React from 'react'
import { storiesOf } from '@storybook/react'
import About from '../components/pages/About'

storiesOf('Content pages')
  .add('the About page', () => {
    return (
      <About />
    )
  })
