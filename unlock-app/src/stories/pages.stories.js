import React from 'react'
import { storiesOf } from '@storybook/react'
import Pages from '../components/pages'
import StoryRouter from 'storybook-react-router'

storiesOf('Content pages', Pages)
  .addDecorator(StoryRouter())
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
