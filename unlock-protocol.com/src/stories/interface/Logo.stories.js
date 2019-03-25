import React from 'react'
import { storiesOf } from '@storybook/react'
import { RoundedLogo } from '../../components/interface/Logo'

storiesOf('Logo', module)
  .add('default size', () => <RoundedLogo />)
  .add('large size', () => <RoundedLogo size="120px" />)
  .add('small size', () => <RoundedLogo size="28px" />)
