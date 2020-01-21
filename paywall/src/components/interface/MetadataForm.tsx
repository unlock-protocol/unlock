import React from 'react'
import styled from 'styled-components'
import { MetadataInput } from '../../unlockTypes'
import { MetadataInput as Field } from './MetadataInput'
import { ActionButton } from './buttons/ActionButton'

interface Props {
  fields: MetadataInput[]
  onSubmit: (values: { [key: string]: string }) => void
}

export const MetadataForm = ({ fields, onSubmit }: Props) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // TODO: collect form data and submit as k/v pairs here
    onSubmit({})
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>We need to collect some additional information for your purchase.</p>
      <FieldWrapper>
        {fields.map(({ name, type, required }) => (
          <Field key={name} name={name} type={type} required={required} />
        ))}
      </FieldWrapper>
      <ActionButton type="submit">Continue</ActionButton>
    </form>
  )
}

export default MetadataForm

const FieldWrapper = styled.div`
  margin-bottom: 32px;
`
