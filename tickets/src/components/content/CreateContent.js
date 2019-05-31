import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import styled from 'styled-components'
import Select from 'react-select'
import Head from 'next/head'
import Media from '../../theme/media'
import Layout from '../interface/Layout'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import DatePicker from '../interface/DatePicker'
import BrowserOnly from '../helpers/BrowserOnly'
import EventUrl from '../helpers/EventUrl'
import { pageTitle } from '../../constants'
import UnlockPropTypes from '../../propTypes'
import { addEvent, loadEvent } from '../../actions/event'
import CreateEventButton from './create/CreateEventButton'
import withConfig from '../../utils/withConfig'
import TimePicker from '../interface/TimePicker'

export const formValuesToEvent = formValues => {
  const { lockAddress, name, description, location, date } = formValues
  return {
    lockAddress,
    name,
    description,
    location,
    date,
  }
}

export class CreateContent extends Component {
  constructor(props) {
    super(props)
    const { now, locks, submitted, event } = props

    this.defaultState = {
      lockAddress: '',
      name: '',
      description: '',
      location: '',
      date: now,
      submitted: false,
    }

    this.state = {
      lockAddress:
        locks[0] || event.lockAddress || this.defaultState.lockAddress,
      name: event.name || this.defaultState.name,
      description: event.description || this.defaultState.description,
      location: event.location || this.defaultState.location,
      date: event.date || this.defaultState.date,
      submitted: submitted || this.defaultState.submitted,
    }

    this.onChange = this.onChange.bind(this)
    this.dateChanged = this.dateChanged.bind(this)
    this.timeChanged = this.timeChanged.bind(this)
    this.lockChanged = this.lockChanged.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.updateStateFromEvent = this.updateStateFromEvent.bind(this)
  }

  componentDidUpdate(prevProps) {
    const { event } = this.props
    const { event: prevEvent } = prevProps
    if (event !== prevEvent) this.updateStateFromEvent(event)
  }

  onChange(field) {
    return event => {
      const value = event.target.value
      this.changeField(field, value)
    }
  }

  onSubmit(e) {
    e.preventDefault()
    this.saveEvent()
    return
  }

  updateStateFromEvent(event) {
    this.setState(state => {
      return {
        ...state,
        name: event.name,
        lockAddress: event.lockAddress,
        description: event.description,
        date: event.date,
        location: event.location,
      }
    })
  }

  changeField(field, value) {
    this.setState(state => {
      return { ...state, submitted: false, [field]: value }
    })
  }

  lockChanged(address) {
    const { loadEvent } = this.props
    this.setState(state => {
      return {
        ...state,
        ...this.defaultState,
        lockAddress: address,
      }
    })
    loadEvent(address)
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
      return {
        ...state,
        date,
      }
    })
  }

  saveEvent() {
    const { account, addEvent } = this.props
    const newEvent = formValuesToEvent(this.state)
    addEvent({
      ...newEvent,
      logo: '', // TODO add logo support
      owner: account.address,
    })
    this.setState(state => ({ ...state, submitted: true }))
  }

  render() {
    const { locks, now, config } = this.props
    const {
      date,
      name,
      description,
      location,
      lockAddress,
      submitted,
    } = this.state

    return (
      <GlobalErrorConsumer>
        <BrowserOnly>
          <Layout title="Tickets" forContent>
            <Head>
              <title>{pageTitle('Create Ticket')}</title>
            </Head>
            <form onSubmit={this.onSubmit}>
              <Steps>
                <Step>
                  <Title>Select your Lock</Title>
                  <Fieldset>
                    <Label>Lock address</Label>
                    <Label>&nbsp;</Label>
                    <StyledSelect
                      placeholder="Choose a lock"
                      className="select-container"
                      classNamePrefix="select-option"
                      options={locks.map(savedLock => ({
                        value: savedLock,
                        label: savedLock,
                      }))}
                      onChange={selectedOption => {
                        if (selectedOption.value)
                          this.lockChanged(selectedOption.value)
                      }}
                    />
                    <Text>
                      Don’t have a lock? <br />
                      <Cta href={config.unlockAppUrl} target="_blank">
                        Create a new lock on unlock-protocol.com
                      </Cta>
                    </Text>
                  </Fieldset>
                </Step>
                <Step>
                  <Title>Set Your Events Preferences</Title>
                  <Fieldset>
                    <Field>
                      <Label>Event Name</Label>
                      <Input
                        placeholder="Give it a nice name"
                        onChange={this.onChange('name')}
                        value={name}
                      />
                    </Field>
                    <Field>
                      <Label>About</Label>
                      <TextArea
                        placeholder="Your about text in 200 characters or less."
                        onChange={this.onChange('description')}
                        value={description}
                      />
                    </Field>
                    <Field>
                      <Label>Date</Label>
                      <DatePicker
                        now={now}
                        date={date}
                        onChange={this.dateChanged}
                      />
                    </Field>
                    <Field>
                      <Label>Location</Label>
                      <Input
                        onChange={this.onChange('location')}
                        value={location}
                      />
                    </Field>
                    <Field>
                      <Label>Start Time</Label>
                      <TimePicker
                        now={now}
                        date={date}
                        onChange={this.timeChanged}
                      />
                    </Field>
                  </Fieldset>
                </Step>
                <Step>
                  <Title>Share Your RSVP Page</Title>
                  <Fieldset>
                    <CreateEventButton submitted={submitted} />
                    {submitted && <EventUrl address={lockAddress} />}
                  </Fieldset>
                </Step>
              </Steps>
            </form>
          </Layout>
        </BrowserOnly>
      </GlobalErrorConsumer>
    )
  }
}

CreateContent.propTypes = {
  now: PropTypes.instanceOf(Date).isRequired,
  account: UnlockPropTypes.account,
  addEvent: PropTypes.func.isRequired,
  loadEvent: PropTypes.func.isRequired,
  event: UnlockPropTypes.ticketedEvent,
  locks: PropTypes.arrayOf(PropTypes.string),
  submitted: PropTypes.bool,
  config: UnlockPropTypes.configuration.isRequired,
}

CreateContent.defaultProps = {
  locks: [],
  event: {},
  account: null,
  submitted: false,
}

export const mapStateToProps = ({ locks, account, event }, { now }) => {
  let selectLocks = Object.values(locks)
    .filter(lock => lock.owner === account.address)
    .map(lock => lock.address)

  return {
    locks: selectLocks,
    account,
    now: now || new Date(),
    event,
  }
}

export const mapDispatchToProps = dispatch => ({
  addEvent: event => dispatch(addEvent(event)),
  loadEvent: address => dispatch(loadEvent(address)),
})

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CreateContent)
)

const StyledSelect = styled(Select)`
  background-color: var(--offwhite);
  border-radius: 4px;

  .select-option__control {
    background-color: var(--offwhite);
    border: none;
    height: 60px;
    border-radius: 4px;
  }
  .select-option__indicator-separator {
    display: none;
  }
  .select-option__single-value {
    color: var(--darkgrey);
    font-size: 20px;
  }
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

const Steps = styled.ol`
  margin-top: 30px;
  padding-right: 20px;
  font-family: 'IBM Plex Sans';
  font-weight: 300;
  font-size: 24px;
  color: var(--grey);
`

const Step = styled.li`
  margin-bottom: 60px;
`

export const Fieldset = styled.div`
  padding: 0;
  border: none;

  ${Media.nophone`
    display: grid;
    grid-gap: 30px;
    grid-template-columns: repeat(2, minmax(250px, 1fr));
    align-items: top;
  `}
`

export const Field = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 25px auto;
  align-items: top;
  ${Media.phone`
    margin-bottom: 15px;
  `}
`

const Text = styled.label`
  font-size: 13px;
  color: var(--darkgrey);
`
export const Label = Text

const Cta = styled.a`
  clear: both;
  font-size: 16px;
  color: var(--link);
`

const TextArea = styled.textarea`
  height: 60px;
  border: none;
  background-color: var(--offwhite);
  border-radius: 4px;
  padding: 16px 10px;
  font-size: 16px;
  font-family: 'IBM Plex Sans';
  height: 150px;
  color: var(--darkgrey);
`

const Title = styled.h1`
  ${Media.phone`
    margin-top 20px;
  `};

  margin-bottom: 20px;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  font-style: light;
  line-height: 47px;
  grid-column: 1 3;
  color: var(--darkgrey);
`
