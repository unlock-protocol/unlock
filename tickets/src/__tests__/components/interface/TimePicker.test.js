/* eslint react/prop-types: 0, react/display-name: 0 */
import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import TimePicker from '../../../components/interface/TimePicker'

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

describe('TimePicker', () => {
  it('should show the current time by default', () => {
    expect.assertions(2)
    const date = new Date('2019-03-02T00:11:35.000Z') // The important piece here is 11:34am

    let wrapper = rtl.render(<TimePicker date={date} onChange={jest.fn()} />)

    expect(wrapper.queryByText('11')).not.toBeNull()
    expect(wrapper.queryByText('35')).not.toBeNull()
  })

  it('should let the user pick an hour and trigger onChange', () => {
    expect.assertions(1)
    const onChange = jest.fn()
    const date = new Date('2020-03-02T00:00:00.000') // March 2nd, 2019
    let wrapper = rtl.render(<TimePicker date={date} onChange={onChange} />)
    rtl.fireEvent.change(wrapper.getByTestId('Hour'), {
      target: { value: '6' }, // Changed to 23
    })
    expect(onChange).toHaveBeenCalledWith(new Date('2020-03-02T06:00:00.000'))
  })

  it('should let the user pick a minute and trigger onChange', () => {
    expect.assertions(1)
    const onChange = jest.fn()
    const date = new Date('2020-03-02T00:00:00.000') // March 2nd, 2019
    let wrapper = rtl.render(<TimePicker date={date} onChange={onChange} />)
    rtl.fireEvent.change(wrapper.getByTestId('Minute'), {
      target: { value: '15' }, // Changed to 15
    })
    expect(onChange).toHaveBeenCalledWith(new Date('2020-03-02T00:15:00.000'))
  })
})
