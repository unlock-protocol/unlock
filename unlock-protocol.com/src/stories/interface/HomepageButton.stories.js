import React from 'react'
import { storiesOf } from '@storybook/react'
import { HomepageButton } from '../../components/interface/buttons/homepage/HomepageButton'

storiesOf('HomepageButton', module)
  .add('Default state', () => {
    return <HomepageButton />
  })
  .add('Accepted terms', () => {
    return <HomepageButton acceptedTerms />
  })
