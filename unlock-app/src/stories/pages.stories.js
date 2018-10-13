import React from 'react'
import { storiesOf } from '@storybook/react'
import Pages from '../pages'

storiesOf('Content pages', Pages)
  .add('the Home page', () => {
    return (
      <Pages.Home />
    )
  })
  .add('the About page', () => {
    return (
      <Pages.About />
    )
  })
  .add('the Jobs page', () => {
    return (
      <Pages.Jobs />
    )
  })
