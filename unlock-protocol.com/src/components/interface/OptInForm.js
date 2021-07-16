import React from 'react'
import styled from 'styled-components'
import Svg from './svg'
import Media from '../../theme/media'

export const OptInForm = () => (
  <Form
    action="https://unlock-protocol.us17.list-manage.com/subscribe/post?u=557de63fe04b1fc4212f4ffab&amp;id=6764cd60ef"
    method="post"
    className="subscribe"
    rel="noopener noreferrer"
    target="_blank"
  >
    <EmailInput
      type="email"
      placeholder="Your email here"
      id="mce-EMAIL"
      name="EMAIL"
      required
    />
    <Subscribe>
      <Icon size="24">
        <Svg.Checkmark />
      </Icon>
      Submit
    </Subscribe>
  </Form>
)

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
