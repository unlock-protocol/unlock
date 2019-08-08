import styled from 'styled-components'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../../propTypes'
import { sendConfirmation } from '../../../actions/email'
import Media from '../../../theme/media'

import { KeyStatus } from '../../../selectors/keys'
import TicketCode from './TicketCode'
import withConfig from '../../../utils/withConfig'

const getDataUriFromCanvas = () => {
  const canvas = document.querySelector('canvas')
  if (canvas) {
    return canvas.toDataURL()
  }
}
export class Ticket extends Component {
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      sent: false,
    }
  }

  handleChange = event => {
    const email = event.target.value
    this.setState(state => {
      return {
        ...state,
        email,
      }
    })
  }

  handleSubmit = evt => {
    evt.preventDefault()
    const { sendConfirmation, event, getDataUriFromCanvas } = this.props
    const { email, sent } = this.state

    if (!sent && email) {
      // We could do email validation but since we use type="email" the browser will actually not even let us submit the form.
      const dataUri = getDataUriFromCanvas()
      if (dataUri) {
        sendConfirmation(
          email,
          dataUri,
          event.name,
          event.date.toDateString(),
          window.location.toString()
        )
        // remember as sent!
        this.setState(state => {
          return {
            ...state,
            sent: true,
          }
        })
      }
    }
  }

  render() {
    const { account, lock, signedLockAddress, keyStatus } = this.props
    const { email, sent } = this.state
    if (keyStatus !== KeyStatus.VALID) {
      return null
    }

    return (
      <TicketInfo>
        <TicketCode
          publicKey={account.address}
          signedAddress={signedLockAddress}
          lockAddress={lock.address}
        />
        <Form onSubmit={this.handleSubmit}>
          <Input
            disabled={sent}
            placeholder="Enter your email address"
            type="email"
            value={email}
            onChange={this.handleChange}
          />
          <SendButton
            type="submit"
            disabled={sent || !email}
            value={sent ? 'Sent!' : 'Send'}
          />
        </Form>
      </TicketInfo>
    )
  }
}

export const mapDispatchToProps = dispatch => ({
  sendConfirmation: (recipient, ticket, eventName, eventDate, ticketLink) => {
    dispatch(
      sendConfirmation(recipient, ticket, eventName, eventDate, ticketLink)
    )
  },
})

export const mapStateToProps = ({ tickets, event }, props) => {
  const { lock, account } = props
  let signedLockAddress
  if (tickets[lock.address]) {
    signedLockAddress = tickets[lock.address]
  }

  return {
    signedLockAddress,
    account,
    lock,
    event,
  }
}

Ticket.propTypes = {
  account: UnlockPropTypes.account.isRequired,
  lock: UnlockPropTypes.lock.isRequired,
  sendConfirmation: PropTypes.func.isRequired,
  signedLockAddress: PropTypes.string,
  keyStatus: PropTypes.string,
  event: UnlockPropTypes.ticketedEvent,
  getDataUriFromCanvas: PropTypes.func,
}

Ticket.defaultProps = {
  signedLockAddress: null,
  keyStatus: null,
  event: null,
  getDataUriFromCanvas,
}

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Ticket)
)

const Form = styled.form`
  display: grid;
  grid-gap: 10px;
`

const SendButton = styled.input`
  background-color: ${props =>
    props.disabled ? 'var(--grey)' : 'var(--green)'};
  border: none;
  font-size: 16px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  transition: background-color 200ms ease;
  & :hover {
    background-color: ${props =>
      props.disabled ? 'var(--grey)' : 'var(--activegreen)'};
  }
  height: 60px;
  ${Media.phone`
    width: 100%;
  `};
`

const TicketInfo = styled.div`
  display: grid;
  grid-gap: 20px;

  ${Media.phone`
    justify-content: center;
  `}
`

const Input = styled.input`
  height: 60px;
  border: none;
  background-color: var(--offwhite);
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
  color: var(--darkgrey);
`
