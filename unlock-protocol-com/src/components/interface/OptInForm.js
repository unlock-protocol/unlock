import React, { useState } from 'react'
import styled from 'styled-components'
import Svg from './svg'
import Media from '../../theme/media'

export const OptInForm = () => {
  const [email, setEmail] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    const portalId = '19942922'
    const formGuid = '868101be-ae3e-422e-bc86-356c96939187'
    const options = {
      method: 'POST',
      body: JSON.stringify({
        portalId,
        formGuid,
        fields: [
          {
            name: 'email',
            value: email,
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }

    // send POST request
    fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
      options
    )
    alert('Thanks! We sent a confirmation email, please check it out!')
    setEmail('')
  }
  return (
    <Form id="newsletter-signup-form" onSubmit={handleSubmit}>
      <EmailInput
        type="email"
        placeholder="Your email here"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Subscribe type="submit">
        <Icon size="24">
          <Svg.Checkmark />
        </Icon>
        Submit
      </Subscribe>
    </Form>
  )
}

export default OptInForm

const Form = styled.form`
  display: flex;
  ${Media.phone`
  flex-direction: column;
  `}
`

const Icon = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 100%;
  margin-right: 12px;
  background-color: var(--white);
  svg {
    fill: var(--link);
  }
`

const EmailInput = styled.input`
  background: var(--lightgrey);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  border: 0;
  padding: 16px;
  border-radius: 4px;
  width: 400px;
  margin-right: 16px;
  ${Media.phone`
  margin-bottom: 16px;
  width: 100%;
  `}
`

const Subscribe = styled.button`
  display: flex;
  background-color: ${(props) =>
    props.disabled ? 'var(--grey)' : 'transparent'};
  border: none;
  font-size: 16px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  border: 1px solid var(--white);
  cursor: ${(props) => (props.disabled ? 'auto' : 'pointer')};
  outline: none;
  transition: background-color 200ms ease;
  padding: 16px;

  &:hover {
    background-color: var(--white);
    color: var(--link);

    ${Icon} {
      background-color: var(--link);
    }
    svg {
      fill: var(--white);
    }
  }
`
