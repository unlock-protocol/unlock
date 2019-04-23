/* eslint react/prop-types: 0 */
import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import {
  CreateContent,
  mapStateToProps,
} from '../../../components/content/CreateContent'
import createUnlockStore from '../../../createUnlockStore'

const inputLocks = {
  abc123: { address: 'abc123' },
  def459: { address: 'def456' },
}

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

describe('CreateContent', () => {
  it('should populate the select box with given redux locks', () => {
    expect.assertions(2)

    const store = createUnlockStore({ locks: inputLocks })

    const form = rtl.render(
      <Provider store={store}>
        <CreateContent locks={['abc123', 'def456']} />
      </Provider>
    )
    expect(form.container.querySelector('option[value="abc123"]').text).toEqual(
      'abc123'
    )
    expect(form.container.querySelector('option[value="def456"]').text).toEqual(
      'def456'
    )
  })

  it('should not populate pulldown if there are no locks', () => {
    expect.assertions(2)

    const store = createUnlockStore({ locks: {} })

    const form = rtl.render(
      <Provider store={store}>
        <CreateContent locks={[]} />
      </Provider>
    )
    const select = form.container.querySelector('select') // Get first select on the page
    expect(select).not.toBe(null)
    expect(select.querySelectorAll('option').length).toEqual(0)
  })

  it('should save a new event', () => {
    expect.assertions(2)

    const store = createUnlockStore({
      account: { address: 'ben' },
      locks: inputLocks,
    })
    const addEvent = jest.fn()

    const now = new Date('2019-03-02T00:00:00.000') // March 2nd, 2019

    const form = rtl.render(
      <Provider store={store}>
        <CreateContent
          account={{ address: 'ben' }}
          locks={['abc123', 'def456']}
          addEvent={addEvent}
          now={now}
        />
      </Provider>
    )

    rtl.fireEvent.change(form.getByTestId('Choose a lock'), {
      target: { value: 'abc123' }, // Selected abc123 lock
    })
    rtl.fireEvent.change(form.getByTestId('Pick a year'), {
      target: { value: '2020' },
    })
    rtl.fireEvent.change(form.getByTestId('Pick a month'), {
      target: { value: '10' },
    })
    rtl.fireEvent.change(form.getByTestId('Pick a day'), {
      target: { value: '23' },
    })

    const submit = form.getByText('Save Event')
    expect(submit).not.toBeNull()
    rtl.fireEvent.click(submit)

    let date = new Date('2020-11-23T00:00:00.000')
    expect(addEvent).toHaveBeenCalledWith({
      lockAddress: 'abc123',
      name: '',
      description: '',
      location: '',
      owner: 'ben',
      logo: '',
      date,
    })
  })
})

describe('mapStateToProps', () => {
  it('should return an array of locks when given a redux lock object', () => {
    expect.assertions(4)
    const props = mapStateToProps({ locks: inputLocks }, { now: null })

    expect(props.locks.length).toEqual(2)
    expect(props.locks[0]).toEqual('abc123')
    expect(props.locks[1]).toEqual('def456')
    expect(props.now).toBeInstanceOf(Date)
  })
})
