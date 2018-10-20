import React from 'react'
import { storiesOf } from '@storybook/react'
import Home from '../pages'
import About from '../pages/about'
import Jobs from '../pages/jobs'

storiesOf('Content pages', module)
  .add('the Home page', () => {
    return (
      <Home />
    )
  })
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
