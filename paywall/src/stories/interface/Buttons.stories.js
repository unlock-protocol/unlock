import React from 'react'
import { storiesOf } from '@storybook/react'
import ActionButton from '../../components/interface/buttons/ActionButton'

storiesOf('Buttons', module).add('ActionButton Basic', () => {
  return <ActionButton>Button</ActionButton>
})
