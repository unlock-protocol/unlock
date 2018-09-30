import React from 'react'
import { storiesOf } from '@storybook/react'
import Logo from '../../components/interface/Logo'

storiesOf('Logo', Logo)
  .add('default size', () => (
    <Logo />
  ))
  .add('large size', () => (
    <Logo size="120px" />
  ))
  .add('small size', () => (
    <Logo size="28px" />
  ))
