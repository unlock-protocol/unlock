import React from 'react'
import { connect } from 'react-redux'
import { sendConfirmation } from '../../actions/email'
import { TicketInfo, Form, Input, SendButton } from './EventStyles'

interface Props {
  sendConfirmation: typeof sendConfirmation
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
    const { email, sent } = this.state
    return (
      <TicketInfo>
        <Form onSubmit={this.handleSubmit}>
          <h2>A QR Code</h2>
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
