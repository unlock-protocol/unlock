/* eslint react/prop-types: 0, react/display-name: 0 */
import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import DatePicker, {
  getDaysMonthsAndYearsForSelect,
} from '../../../components/interface/DatePicker'

jest.mock('../../../utils/dates', () => ({
  getDaysMonthsAndYears: () => {
    return [[1, 2, 3], [1, 2, 3], [2019, 2020, 2021]]
  },
}))

// Fake select to mock react-select
jest.mock('react-select', () => ({ options, value, onChange, placeholder }) => {
  function handleChange(event) {
    const option = options.find(option => {
      return option.value.toString() === event.currentTarget.value
    })
    onChange(option)
  }
  return (
    <select data-testid={placeholder} value={value} onChange={handleChange}>
      {' '}
      {options.map(({ label, value }) => (
        <option key={value} value={value}>
          {' '}
          {label}{' '}
        </option>
      ))}{' '}
    </select>
  )
})

describe('DatePicker', () => {
  it('should show today s date by default', () => {
    expect.assertions(3)
    const now = new Date('2019-03-02T00:00:00.000Z') // March 2nd, 2019
    let wrapper = rtl.render(<DatePicker now={now} onChange={jest.fn()} />)
    expect(wrapper.queryByText('2019')).not.toBeNull()
    expect(wrapper.queryByText('Mar')).not.toBeNull()
    expect(wrapper.queryByText('2')).not.toBeNull()
  })

  it('should show a date in the future if it has been initialized with this', () => {
    expect.assertions(3)
    const now = new Date('2019-03-02T00:00:00.000Z') // March 2nd, 2019
    const date = new Date('2020-03-02T00:00:00.000Z') // March 2nd, 2020
    let wrapper = rtl.render(
      <DatePicker now={now} date={date} onChange={jest.fn()} />
    )
    expect(wrapper.queryByText('2020')).not.toBeNull()
    expect(wrapper.queryByText('Mar')).not.toBeNull()
    expect(wrapper.queryByText('2')).not.toBeNull()
  })

  it('should let the user pick a year and trigger onChange', () => {
    expect.assertions(1)
    const onChange = jest.fn()
    const now = new Date('2019-03-02T00:00:00.000Z') // March 2nd, 2019
    let wrapper = rtl.render(<DatePicker now={now} onChange={onChange} />)
    rtl.fireEvent.change(wrapper.getByTestId('Pick a year'), {
      target: { value: '2020' }, // Changed to 2020
    })
    expect(onChange).toHaveBeenCalledWith(new Date('2020-03-02T00:00:00.000Z'))
  })

  it('should let the user pick a month and trigger onChange', () => {
    expect.assertions(1)
    const onChange = jest.fn()
    const now = new Date('2019-03-02T00:00:00.000Z') // March 2nd, 2019
    let wrapper = rtl.render(<DatePicker now={now} onChange={onChange} />)
    rtl.fireEvent.change(wrapper.getByTestId('Pick a month'), {
      target: { value: '0' }, // Changed to January
    })
    expect(onChange).toHaveBeenCalledWith(new Date('2019-01-02T00:00:00.000Z'))
  })

  it('should let the user pick a day and trigger onChange', () => {
    expect.assertions(1)
    const onChange = jest.fn()
    const now = new Date('2019-03-02T00:00:00.000') // March 2nd, 2019
    let wrapper = rtl.render(<DatePicker now={now} onChange={onChange} />)
    rtl.fireEvent.change(wrapper.getByTestId('Pick a day'), {
      target: { value: '3' }, // Changed to the 3rd
    })
    expect(onChange).toHaveBeenCalledWith(new Date('2019-03-03T00:00:00.000'))
  })

  describe('getDaysMonthsAndYearsForSelect', () => {
    it('should return an array of options for days, months and years based on getDaysMonthsAndYears', () => {
      expect.assertions(1)
      const now = new Date('2019-03-02T00:00:00.000Z') // March 2nd, 2019
      const year = 2019
      const month = 2
      const options = getDaysMonthsAndYearsForSelect(now, year, month)
      expect(options).toEqual({
        days: [
          { value: 1, label: 1 },
          { value: 2, label: 2 },
          { value: 3, label: 3 },
        ],
        months: [
          { value: 0, label: 'Jan' },
          { value: 1, label: 'Feb' },
          { value: 2, label: 'Mar' },
        ],
        years: [
          { value: 2019, label: 2019 },
          { value: 2020, label: 2020 },
          { value: 2021, label: 2021 },
        ],
      })
    })
  })
})
