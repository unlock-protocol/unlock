import React from 'react'
import { storiesOf } from '@storybook/react'
import { MetadataInput } from '../../components/interface/MetadataInput'

const allTheInputs = isRequired => {
  return (
    <div>
      <MetadataInput name="General Text" type="text" required={isRequired} />
      <MetadataInput name="Date" type="date" required={isRequired} />
      <MetadataInput name="Color" type="color" required={isRequired} />
      <MetadataInput name="Email Address" type="email" required={isRequired} />
      <MetadataInput name="URL" type="url" required={isRequired} />
    </div>
  )
}

storiesOf('MetadataInput', module)
  .add('Standard', () => {
    return allTheInputs(false)
  })
  .add('Required', () => {
    return allTheInputs(true)
  })
