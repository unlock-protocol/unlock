import React from 'react'
import { storiesOf } from '@storybook/react'
import { HomepageButton } from '../../components/interface/buttons/homepage/HomepageButton'
import configure from '../../config'

const config = configure()

storiesOf('HomepageButton', module)
  .add('Default state', () => {
    return <HomepageButton />
  })
  .add('Accepted terms', () => {
    return <HomepageButton config={config} acceptedTerms />
  })
