import React from 'react'
import { storiesOf } from '@storybook/react'
import Loading, { InlineLoading } from '../../components/interface/Loading'

storiesOf('Loading', module)
  .add('the loading icon', () => {
    return <Loading />
  })
  .add('the inline loading icon', () => {
    return <InlineLoading />
  })
