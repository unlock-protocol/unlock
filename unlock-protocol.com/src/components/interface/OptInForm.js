import React from 'react'
import styled from 'styled-components'
import ActionButton from './ActionButton'
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
    <Subscribe>Subscribe</Subscribe>
  </Form>
)

export default OptInForm

const Form = styled.form`
  display: grid;
  ${Media.nophone`
    grid-template-columns: minmax(180px, 364px) 212px;
  `}
  grid-gap: 16px;
  margin: auto;
  margin-top: 25px;
`

const EmailInput = styled.input`
  background: var(--lightgrey);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  border: 0;
  padding: 20px;
`

const Subscribe = styled(ActionButton)`
  color: var(--white);
  padding: 20px 50px;
`
