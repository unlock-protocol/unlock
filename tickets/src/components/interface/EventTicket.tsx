import React from 'react'
import { connect } from 'react-redux'
import { sendConfirmation } from '../../actions/email'
import { TicketInfo, Form, Input, SendButton } from './EventStyles'
import EventQRCode from './EventQRCode'

interface Props {
  sendConfirmation: typeof sendConfirmation
  lockAddress: string
}
interface State {
  email: string
  sent: boolean
}

export class EventTicket extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      email: '',
      sent: false,
    }
  }

  handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const email = e.currentTarget.value

    this.setState({
      email,
    })
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { email, sent } = this.state
    const { sendConfirmation } = this.props

    if (!sent && email) {
      // We could do email validation but since we use type="email" the browser
      // will actually not even let us submit the form.

      sendConfirmation(
        email,
        '', // data uri for QR code
        '', // event name
        '', // event date toDateString()
        '' // window location.toString()
      )

      this.setState({
        sent: true,
      })
    }
  }

  render = () => {
    const { lockAddress } = this.props
    const { email, sent } = this.state
    return (
      <TicketInfo>
        <Form onSubmit={this.handleSubmit}>
          <h2>Your Ticket</h2>
          <EventQRCode
            payload={{
              lockAddress,
            }}
          />
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

export default connect(
  null,
  {
    sendConfirmation: sendConfirmation,
  }
)(EventTicket)
