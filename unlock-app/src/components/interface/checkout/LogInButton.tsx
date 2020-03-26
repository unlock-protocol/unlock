import React from 'react'
import styled from 'styled-components'

interface Props {
  onClick: () => void
}

export const LogInButton = ({ onClick }: Props) => {
  return (
    <Button
      type="button"
      value="Login to pay with credit card"
      onClick={onClick}
    />
  )
}

const Button = styled.input`
  font-size: 16px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 10px;
  color: var(--blue);
  margin-top: 33px;
`
