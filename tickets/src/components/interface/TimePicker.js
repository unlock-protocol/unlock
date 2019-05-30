import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { EventDate, StyledSelect } from './DatePicker'

export default class TimePicker extends Component {
  constructor(props) {
    super(props)

    const { now } = props
    this.state = {
      date: now, // defaults to now
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange(method) {
    return selected => {
      this.setState(state => {
        let date = state.date

        // Change the date based on the selected value
        date[method](selected.value)

        const newState = {
          ...state,
          date,
        }

        const { onChange } = this.props
        onChange(date)

        return newState
      })
    }
  }

  render() {
    const { date } = this.state
    let hour = {
      value: date.getHours(),
      label: date
        .getHours()
        .toString()
        .padStart(2, '0'),
    }
    const minute = {
      value: date.getMinutes(),
      label: date
        .getMinutes()
        .toString()
        .padStart(2, '0'),
    }

    let hours = []
    let minutes = []
    let i

    for (i = 0; i < 24; i++)
      hours.push({ value: i, label: i.toString().padStart(2, '0') })
    for (i = 0; i < 60; i++)
      minutes.push({ value: i, label: i.toString().padStart(2, '0') })

    return (
      <TimeDate>
        <StyledSelect
          placeholder="Hour"
          className="select-container"
          classNamePrefix="select-option"
          onChange={this.onChange('setHours')}
          options={hours}
          value={hour}
        />
        <Divider>:</Divider>
        <StyledSelect
          placeholder="Minute"
          className="select-container"
          classNamePrefix="select-option"
          onChange={this.onChange('setMinutes')}
          options={minutes}
          value={minute}
        />
      </TimeDate>
    )
  }
}

TimePicker.propTypes = {
  now: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
}

TimePicker.defaultProps = {
  now: new Date(),
}

const Divider = styled.div`
  font-size: 20px;
  height: 60px;
  padding-top: 15px;
  text-align: center;
`

const TimeDate = styled(EventDate)`
  grid-template-columns: minmax(60px, 1fr) 15px minmax(50px, 1fr);
`
