import React from 'react'
import { connect } from 'react-redux'
import { sendConfirmation } from '../../actions/email'
import { TicketInfo, Form, Input, SendButton } from './EventStyles'
import EventQRCode from './EventQRCode'
import withConfig from '../../utils/withConfig'

interface Props {
  sendConfirmation: typeof sendConfirmation
  lockAddress: string
  event: {
    name: string
    date: Date
  }
  config?: {
    unlockTicketsUrl: string
  }
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
    const { sendConfirmation, event } = this.props

    /* let qrDataUri: string = ''

     * const canvas = document.querySelector('canvas')
     * if (canvas) {
     *   qrDataUri = canvas.toDataURL()
     * } */

    if (!sent && email) {
      // We could do email validation but since we use type="email" the browser
      // will actually not even let us submit the form.

      sendConfirmation(
        email,
        null, // data uri for QR code
        event.name, // event name
        event.date.toDateString(), // event date toDateString()
        window.location.toString() // window location.toString()
      )

      this.setState({
        sent: true,
      })
    }
  }

  render = () => {
    const { lockAddress, config } = this.props
    const { email, sent } = this.state

    let validateUri = ''
    if (config) {
      validateUri = config.unlockTicketsUrl + '/checkin/' + lockAddress
    }
    return (
      <TicketInfo>
        <Form onSubmit={this.handleSubmit}>
          <h2>Your Ticket</h2>
          <EventQRCode payload={validateUri} />
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
)(withConfig(EventTicket))
