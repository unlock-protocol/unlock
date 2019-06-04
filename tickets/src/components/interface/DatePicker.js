import styled from 'styled-components'
import PropTypes from 'prop-types'
import Select from 'react-select'
import React, { Component } from 'react'
import { getDaysMonthsAndYears } from '../../utils/dates'
import { MONTH_NAMES } from '../../constants'

/**
 * This returns options for <select>
 * @param {Date} now
 * @param {Number} year
 * @param {Number} month
 */
export const getDaysMonthsAndYearsForSelect = (now, year, month) => {
  let [days, months, years] = getDaysMonthsAndYears(now, year, month)

  const asOptions = array => {
    return array.map(element => ({ value: element, label: element }))
  }
  return {
    days: asOptions(days),
    months: months.map(m => ({ value: m - 1, label: MONTH_NAMES[m - 1] })),
    years: asOptions(years),
  }
}

export default class DatePicker extends Component {
  constructor(props) {
    super(props)
    const { now } = props
    this.state = {
      ...getDaysMonthsAndYearsForSelect(now),
      date: now, // defaults to now
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange(method) {
    const { now } = this.props
    return selected => {
      this.setState(state => {
        let date = state.date
        // Change the date based on the selected value
        date[method](selected.value)

        // If the day is in the past, we default to today's date
        if (date < now) {
          date = new Date(now)
        }

        const newState = {
          ...state,
          date,
        }

        const { onChange } = this.props
        onChange(date)

        // Get the new possible days, months and years
        const dateState = getDaysMonthsAndYearsForSelect(
          now,
          newState.date.getFullYear(),
          newState.date.getMonth() + 1
        )
        return Object.assign(newState, dateState)
      })
    }
  }

  render() {
    const { date, months, days, years } = this.state

    const month = {
      value: date.getMonth(),
      label: MONTH_NAMES[date.getMonth()],
    }
    const day = { value: date.getDate(), label: date.getDate() }
    const year = { value: date.getFullYear(), label: date.getFullYear() }

    return (
      <EventDate>
        <StyledSelect
          placeholder="Pick a month"
          className="select-container"
          classNamePrefix="select-option"
          options={months}
          onChange={this.onChange('setMonth')}
          value={month}
        />
        <StyledSelect
          placeholder="Pick a day"
          className="select-container"
          classNamePrefix="select-option"
          options={days}
          onChange={this.onChange('setDate')}
          value={day}
        />
        <StyledSelect
          placeholder="Pick a year"
          className="select-container"
          classNamePrefix="select-option"
          options={years}
          onChange={this.onChange('setFullYear')}
          value={year}
        />
      </EventDate>
    )
  }
}

DatePicker.propTypes = {
  now: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
}

DatePicker.defaultProps = {
  now: new Date(),
}

export const EventDate = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(60px, 1fr));
  grid-gap: 10px;
`

export const StyledSelect = styled(Select)`
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
