import React, { useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { MetadataInput, UserMetadata } from '../../../unlockTypes'
import { Button, LoadingButton, Input, Label, SmallButton } from './FormStyles'
import { formResultToMetadata } from '../../../utils/userMetadata'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import { useAccount } from '../../../hooks/useAccount'
import { RecipientItem } from '../../../hooks/useMultipleRecipient'
import { MultipleRecipient } from './MultipleRecipients'

interface Props {
  network: number
  lock: any
  fields: MetadataInput[]
  onSubmit: (metadata: UserMetadata) => void
  recipients: RecipientItem[]
  maxRecipients: number
  addRecipient: any
  loading: boolean
}

interface DefautltValues {
  [key: string]: string
}

export const MetadataForm = ({
  network,
  lock,
  fields = [],
  onSubmit,
  recipients,
  maxRecipients,
  addRecipient,
  loading,
}: Props) => {
  const { account } = useContext(AuthenticationContext)
  // @ts-expect-error account is always defined in this component
  const { setUserMetadataData } = useAccount(account, network)
  const [error, setError] = useState('')
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
  const [skipOptionalFields, setSkipOptionalFields] = useState(false)

  const showSkipButton =
    fields.every((field) => field.required === false) && !submittedForm
  const showMultipleRecipient = maxRecipients > 1
  // The form returns a map of key-value pair strings. We need to
  // process those into the expected metadata format so that the typed
  // data will be correct.
  // TODO: IS THIS USED?
  const wrappedOnSubmit = async (formResult: { [key: string]: string }) => {
    const metadata = formResultToMetadata(formResult, fields)
    setSubmittedForm(true)
    setError('')
    try {
      if (!skipOptionalFields) {
        await setUserMetadataData(lock.address, metadata, network)
      }
      onSubmit(metadata)
    } catch (error: any) {
      setError('We could not save your info, please try again.')
      setSubmittedForm(false)
    }
  }
  return (
    <form onSubmit={handleSubmit(wrappedOnSubmit)}>
      <Message>
        The creator of this lock requires some additional information. Please
        complete the form below.
      </Message>
      {error && <Error>{error}</Error>}

      {fields.map(({ name, type, required, placeholder }) => (
        <StyledLabel required={required} key={name}>
          <span>{name}</span>
          <Input
            placeholder={placeholder}
            type={type}
            {...register(name, { required })}
          />
        </StyledLabel>
      ))}

      {showMultipleRecipient && (
        <MultipleRecipient
          recipients={recipients}
          maxRecipients={maxRecipients}
          addRecipient={addRecipient}
          loading={loading}
        />
      )}

      {submittedForm && <LoadingButton>Saving</LoadingButton>}

      {!submittedForm && <Button type="submit">Save and Continue</Button>}
      {showSkipButton && (
        <SmallButton onClick={() => setSkipOptionalFields(true)}>
          Skip
        </SmallButton>
      )}
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
