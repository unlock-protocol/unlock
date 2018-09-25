import React from 'react'
import { storiesOf } from '@storybook/react'
import Footer from '../../components/interface/Footer'

storiesOf('Footer', Footer)
  .add('the footer', () => {
    return (
      <Footer />
    )
  })
