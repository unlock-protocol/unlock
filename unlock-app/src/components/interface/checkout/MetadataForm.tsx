import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { MetadataInput, UserMetadata } from '../../../unlockTypes'
import { Button, LoadingButton, Input, Label } from './FormStyles'
import { formResultToMetadata } from '../../../utils/userMetadata'
import { useSetUserMetadata } from '../../../hooks/useSetUserMetadata'

interface Props {
  network: number
  lock: any
  fields: MetadataInput[]
  onSubmit: (metadata: UserMetadata) => void
}

interface DefautltValues {
  [key: string]: string
}

export const MetadataForm = ({ network, lock, fields, onSubmit }: Props) => {
  const [error, setError] = useState('')
  const { setUserMetadata } = useSetUserMetadata()

  // We can also destructure the `errors` field here and use it for
  // validation -- we'll have to consider how to handle the different
  // kinds of errors so that we can show the right message

  const defaultValues = {} as DefautltValues
  fields.forEach((field) => {
    if (field.name && field.defaultValue) {
      defaultValues[field.name] = field.defaultValue
    }
  })

  const { handleSubmit, register } = useForm({
    defaultValues,
  })
  const [submittedForm, setSubmittedForm] = useState(false)

  // The form returns a map of key-value pair strings. We need to
  // process those into the expected metadata format so that the typed
  // data will be correct.
  const wrappedOnSubmit = (formResult: { [key: string]: string }) => {
    const metadata = formResultToMetadata(formResult, fields)
    setSubmittedForm(true)
    setError('')
    setUserMetadata(
      lock.address,
      network,
      metadata,
      (error: any, saved: boolean) => {
        if (error || !saved) {
          setError(
            error?.message || 'We could not save your info, please try again.'
          )
          setSubmittedForm(false)
        }
        if (saved) {
          onSubmit(metadata)
        }
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(wrappedOnSubmit)}>
      <Message>
        The creator of this lock requires some additional information. Please
        complete the form below.
      </Message>
      {error && <Error>{error}</Error>}

      {fields.map(({ name, type, required }) => (
        <StyledLabel required={required} key={name}>
          <span>{name}</span>
          <Input type={type} name={name} ref={register({ required })} />
        </StyledLabel>
      ))}

      {submittedForm && <LoadingButton>Saving</LoadingButton>}

      {!submittedForm && <Button type="submit">Save and Continue</Button>}
    </form>
  )
}

export default MetadataForm

interface LabelProps {
  required: boolean
}

const StyledLabel = styled(Label)<LabelProps>`
  & > span:after {
    color: var(--red);
    content: ${(props: LabelProps) => (props.required ? '" *"' : '')};
  }
`
const Message = styled.p``

const Error = styled.p`
  width: 100%;
  border-radius: 4px;
  padding: 12px 8px;
  margin-bottom: 8px;
  cursor: pointer;
  border: thin var(--sharpred) solid;
  background-color: #f24c1533;
`
