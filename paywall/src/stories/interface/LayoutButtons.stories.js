import React from 'react'
import { storiesOf } from '@storybook/react'
import LayoutButtons from '../../components/interface/buttons/layout'

storiesOf('Buttons/Layout Buttons', module)
  .add('Github', () => {
    return <LayoutButtons.Github />
  })
  .add('About', () => {
    return <LayoutButtons.About />
  })
  .add('Bars', () => {
    return <LayoutButtons.Bars />
  })
  .add('ChevronUp', () => {
    return <LayoutButtons.ChevronUp />
  })
  .add('Close Large', () => {
    return <LayoutButtons.Close as="button" size="100px" />
  })
  .add('Close Small', () => {
    return <LayoutButtons.Close as="button" size="16px" />
  })
  .add('Jobs', () => {
    return <LayoutButtons.Jobs />
  })
  .add('Newsletter', () => {
    return <LayoutButtons.Newsletter />
  })
  .add('Telegram', () => {
    return <LayoutButtons.Telegram />
  })
  .add('Twitter', () => {
    return <LayoutButtons.Twitter />
  })
