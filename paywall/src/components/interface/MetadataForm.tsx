import React from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { MetadataInput } from '../../unlockTypes'
import { ActionButton } from './buttons/ActionButton'

interface Props {
  fields: MetadataInput[]
  onSubmit: (values: { [key: string]: string }) => void
}

export const MetadataForm = ({ fields, onSubmit }: Props) => {
  // We can also destructure the `errors` field here and use it for
  // validation -- we'll have to consider how to handle the different
  // kinds of errors so that we can show the right message
  const { handleSubmit, register } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p>We need to collect some additional information for your purchase.</p>
      <FieldWrapper>
        {fields.map(({ name, type, required }) => (
          <Label required={required} key={name}>
            <span>{name}</span>
            <Input type={type} name={name} ref={register({ required })} />
          </Label>
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

const Input = styled.input`
  height: 60px;
  width: 100%;
  background-color: var(--lightgrey);
  border: medium none;
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
`

interface LabelProps {
  required: boolean
}

const Label = styled.label<LabelProps>`
  & > span {
    display: block;
    text-transform: uppercase;
    font-size: 10px;
    color: var(--darkgrey);
    margin-top: 16px;
    margin-bottom: 5px;
  }

  & > span:after {
    color: var(--red);
    content: ${(props: LabelProps) => (props.required ? '" *"' : '')};
  }
`
