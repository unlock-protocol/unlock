import React from 'react'
import { storiesOf } from '@storybook/react'
import Layout from '../../components/interface/Layout'

storiesOf('Layout')
  .add('the layout', () => {
    return (
      <Layout title="The story of Unlock" />
    )
  })
