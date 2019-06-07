import React from 'react'
import { storiesOf } from '@storybook/react'
import ActionButton from '../../components/interface/buttons/ActionButton'

storiesOf('Buttons/ActionButton', module)
  .add('Basic', () => {
    return <ActionButton>Button</ActionButton>
  })
  .add('Disabled', () => {
    return <ActionButton disabled>Button</ActionButton>
  })
