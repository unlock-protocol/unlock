import PropTypes from 'prop-types'
import React, { Component } from 'react'
import UnlockPropTypes from '../../../propTypes'
import DatePicker from '../../interface/DatePicker'
import EventUrl from '../../helpers/EventUrl'
import CreateEventButton from './CreateEventButton'
import TimePicker from '../../interface/TimePicker'
import {
  Title,
  Step,
  Fieldset,
  Field,
  Label,
  Input,
  TextArea,
} from '../../interface/EventStyles'

export const formValuesToEvent = formValues => {
  const { lockAddress, name, description, location, date, website } = formValues
  return {
    lockAddress,
    name,
    description,
    location,
    date,
    logo: '', // TODO add logo support
    links: [
      {
        text: 'Event Website',
        href: website,
      },
    ],
  }
}

export class CreateEventForm extends Component {
  constructor(props) {
    super(props)
    const { event } = this.props
    const { now } = this.props

    this.onChange = this.onChange.bind(this)
    this.onChange = this.onChange.bind(this)
    this.dateChanged = this.dateChanged.bind(this)
    this.timeChanged = this.timeChanged.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    let website = event.links && event.links[0] ? event.links[0].href : ''
    this.state = {
      name: event.name,
      description: event.description,
      date: event.date || now,
      location: event.location,
      website,
      submitted: false,
      lockAddress: event.lockAddress,
    }
  }

  onChange(field) {
    return event => {
      const value = event.target.value
      this.changeField(field, value)
    }
  }

  onSubmit(e) {
    e.preventDefault()
    const { save } = this.props
    const newEvent = formValuesToEvent(this.state)
    save(newEvent)
    this.setState(state => {
      return { ...state, submitted: true }
    })
  }

  changeField(field, value) {
    this.setState(state => {
      return { ...state, submitted: false, [field]: value }
    })
  }

  dateChanged(date) {
    this.setState(state => {
      return {
        ...state,
        date,
      }
    })
  }

  timeChanged(timeDate) {
    this.setState(state => {
      const { date } = state
      date.setHours(timeDate.getHours())
      date.setMinutes(timeDate.getMinutes())
      date.setSeconds(0) // Deterministic times!
      date.setMilliseconds(0) // Deterministic times!
      return {
        ...state,
        date,
      }
    })
  }

  render() {
    const {
      name,
      description,
      date,
      location,
      website,
      submitted,
      lockAddress,
    } = this.state
    const { saved } = this.props

    const { now, disabled } = this.props
    return (
      <form onSubmit={this.onSubmit}>
        <Step>
          <Title>Set Your Events Preferences</Title>
          <Fieldset>
            <Field>
              <Label>Event Name</Label>
              <Input
                disabled={disabled}
                placeholder="Give it a nice name"
                onChange={this.onChange('name')}
                value={name}
              />
            </Field>
            <Field>
              <Label>About</Label>
              <TextArea
                disabled={disabled}
                placeholder="Your about text in 200 characters or less."
                onChange={this.onChange('description')}
                value={description}
              />
            </Field>
            <Field>
              <Label>Date</Label>

              <DatePicker
                disabled={disabled}
                now={now}
                date={date}
                onChange={this.dateChanged}
              />
            </Field>
            <Field>
              <Label>Location</Label>
              <Input
                disabled={disabled}
                onChange={this.onChange('location')}
                value={location}
              />
            </Field>
            <Field>
              <Label>Start Time</Label>
              <TimePicker
                disabled={disabled}
                date={date}
                onChange={this.timeChanged}
              />
            </Field>
            <Field>&nbsp;</Field>
            <Field>
              <Label>Event website</Label>
              <Input
                disabled={disabled}
                type="url"
                placeholder="(Optional) A web page where your visitors can learn more about the event"
                onChange={this.onChange('website')}
                value={website}
              />
            </Field>
          </Fieldset>
        </Step>
        <Step>
          <Title>Share Your RSVP Page</Title>
          <Fieldset>
            <CreateEventButton
              submitted={submitted}
              saved={saved}
              disabled={disabled}
            />
            {saved && <EventUrl address={lockAddress} />}
          </Fieldset>
        </Step>
      </form>
    )
  }
}

CreateEventForm.propTypes = {
  now: PropTypes.instanceOf(Date).isRequired,
  save: PropTypes.func.isRequired,
  event: UnlockPropTypes.ticketedEvent.isRequired,
  disabled: PropTypes.bool,
  saved: PropTypes.bool,
}

CreateEventForm.defaultProps = {
  disabled: false,
  saved: false,
}

export default CreateEventForm
