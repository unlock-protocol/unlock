import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import styled from 'styled-components'
import Select from 'react-select'
import Media from '../../theme/media'
import Layout from '../interface/Layout'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import DatePicker from '../interface/DatePicker'

export class CreateContent extends Component {
  constructor(props) {
    super(props)
    const { now, locks } = props

    this.state = {
      lock: locks[0],
      name: '',
      description: '',
      location: '',
      date: now,
    }

    this.onChange = this.onChange.bind(this)
    this.dateChanged = this.dateChanged.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(e) {
    e.preventDefault()
    return
  }

  onChange(field) {
    return event => {
      const value = event.target.value
      this.setState(state => {
        return { ...state, [field]: value }
      })
    }
  }

  dateChanged(date) {
    this.setState(state => {
      return {
        ...state,
        date,
      }
    })
  }

  render() {
    const { locks } = this.props
    const { date } = this.state
    return (
      <GlobalErrorConsumer>
        <Layout title="Paywall" forContent>
          <form onSubmit={this.onSubmit}>
            <Steps>
              <Step>
                <Title>Select your Lock</Title>
                <Fieldset>
                  <Label>Lock address</Label>
                  <Label>&nbsp;</Label>
                  <StyledSelect
                    className="select-container"
                    classNamePrefix="select-option"
                    options={locks.map(lock => ({ value: lock, label: lock }))}
                  />
                  <Text>
                    Don’t have a lock? <br />
                    <Cta>Create a new lock on unlock-protocol.com</Cta>
                  </Text>
                </Fieldset>
              </Step>
              <Step>
                <Title>Set Your Events Preferences</Title>
                <Fieldset>
                  <Label>Event Name</Label>
                  <Label>About</Label>
                  <Input
                    placeholder="Give it a nice name"
                    onChange={this.onChange('name')}
                  />
                  <TextArea
                    placeholder="Your about text in 200 characters or less."
                    onChange={this.onChange('description')}
                  />
                  <Label>Date</Label>
                  <Label>Location</Label>
                  <DatePicker date={date} onChange={this.dateChanged} />
                  <Input onChange={this.onChange('location')} />
                </Fieldset>
              </Step>
              <Step>
                <Title>Share Your RSVP Page</Title>
                <Fieldset>
                  <SaveButton type="submit">Save Event</SaveButton>
                  <Text>
                    Your event link: <br />
                    <Cta>https://tickets.unlock-protocol/rsvp/0xabc</Cta>
                  </Text>
                </Fieldset>
              </Step>
            </Steps>
          </form>
        </Layout>
      </GlobalErrorConsumer>
    )
  }
}

CreateContent.propTypes = {
  now: PropTypes.instanceOf(Date).isRequired,
  locks: PropTypes.arrayOf(PropTypes.string),
}

CreateContent.defaultProps = {
  locks: [],
}

const mapStateToProps = () => {
  return {
    now: new Date(),
    locks: ['0x123', '0x456', '0x789'],
  }
}

export default connect(mapStateToProps)(CreateContent)

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

const SaveButton = styled.button`
  background-color: var(--green);
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
    background-color: var(--activegreen);
  }
  height: 60px;
  ${Media.phone`
    width: 100%;
  `};
`

const Steps = styled.ol`
  margin-top: 30px;
  font-family: 'IBM Plex Sans';
  font-weight: 300;
  font-size: 24px;
  color: var(--grey);
`

const Step = styled.li`
  padding-left: 10px;
  margin-bottom: 60px;
`

const Fieldset = styled.fieldset`
  padding: 0;
  display: grid;
  border: none;
  grid-gap: 30px;
  grid-template-columns: repeat(2, 1fr);
`

const Text = styled.label`
  font-size: 13px;
  color: var(--darkgrey);
`
const Label = Text

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
