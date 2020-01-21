import React from 'react'
import styled from 'styled-components'
import { MetadataInput as Props } from '../../unlockTypes'

export const MetadataInput = ({ name, type, required }: Props) => {
  return (
    <Label required={required}>
      <span>{name}</span>
      <Input type={type} name={name} required={required} placeholder={name} />
    </Label>
  )
}

export default MetadataInput

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
