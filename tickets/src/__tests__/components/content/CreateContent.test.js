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

const config = {
  unlockAppUrl: 'https://unlock-protocol.com',
}

const account = {
  address: '0x123',
}

const inputLocks = {
  abc123: { address: 'abc123', owner: '0x123' },
  def459: { address: 'def456', owner: '0x123' },
  ghi789: { address: 'ghi789', owner: '0x567' },
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
        <CreateContent
          config={config}
          locks={['abc123', 'def456']}
          loadEvent={jest.fn()}
        />
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
        <CreateContent config={config} locks={[]} loadEvent={jest.fn()} />
      </Provider>
    )
    const select = form.container.querySelector('select') // Get first select on the page
    expect(select).not.toBe(null)
    expect(select.querySelectorAll('option').length).toEqual(0)
  })

  it('should save a new event', () => {
    expect.assertions(3)

    const store = createUnlockStore({
      account: { address: 'ben' },
      locks: inputLocks,
    })
    const addEvent = jest.fn()

    const now = new Date('2019-03-02T00:00:00.000') // March 2nd, 2019

    const form = rtl.render(
      <Provider store={store}>
        <CreateContent
          config={config}
          account={{ address: 'ben' }}
          locks={['abc123', 'def456']}
          addEvent={addEvent}
          now={now}
          loadEvent={jest.fn()}
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
    expect(form.getByText('Event Saved')).not.toBeNull()
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

  it('should load an event on address selection', () => {
    expect.assertions(1)

    const store = createUnlockStore({
      account: { address: 'ben' },
      locks: inputLocks,
    })

    const addEvent = jest.fn()
    const loadEvent = jest.fn()

    const now = new Date('2022-03-02T00:00:00.000') // March 2nd, 2022

    const form = rtl.render(
      <Provider store={store}>
        <CreateContent
          config={config}
          account={{ address: 'ben' }}
          locks={['abc123', 'def456']}
          addEvent={addEvent}
          loadEvent={loadEvent}
          now={now}
        />
      </Provider>
    )

    rtl.fireEvent.change(form.getByTestId('Choose a lock'), {
      target: { value: 'abc123' }, // Selected abc123 lock
    })

    expect(loadEvent).toHaveBeenCalledWith('abc123')
  })

  it('should reset the fields when a different lock is selected', () => {
    expect.assertions(2)

    let date = new Date('2020-11-23T00:00:00.000')
    const store = createUnlockStore({
      account: { address: 'ben' },
      locks: inputLocks,
    })

    const event = {
      lockAddress: 'abc123',
      name: 'Test Event',
      description: 'This is my test event',
      location: 'Testville',
      owner: 'ben',
      logo: '',
      date,
    }
    const addEvent = jest.fn()
    const loadEvent = jest.fn()
    const now = new Date('2022-03-02T00:00:00.000') // March 2nd, 2022

    const form = rtl.render(
      <Provider store={store}>
        <CreateContent
          config={config}
          account={{ address: 'ben' }}
          locks={['abc123', 'def456']}
          addEvent={addEvent}
          loadEvent={loadEvent}
          now={now}
          event={event}
        />
      </Provider>
    )

    expect(form.getByDisplayValue('Test Event')).not.toBeNull()

    // Now select a different lock!
    rtl.fireEvent.change(form.getByTestId('Choose a lock'), {
      target: { value: 'def456' }, // Selected abc123 lock
    })

    expect(form.queryByDisplayValue('Test Event')).toBeNull()
  })

  it('should load an event from props', () => {
    expect.assertions(3)

    let date = new Date('2020-11-23T00:00:00.000')
    const store = createUnlockStore({
      account: { address: 'ben' },
      locks: inputLocks,
    })

    const event = {
      lockAddress: 'abc123',
      name: 'Test Event',
      description: 'This is my test event',
      location: 'Testville',
      owner: 'ben',
      logo: '',
      date,
    }
    const addEvent = jest.fn()
    const loadEvent = jest.fn()
    const now = new Date('2022-03-02T00:00:00.000') // March 2nd, 2022

    const form = rtl.render(
      <Provider store={store}>
        <CreateContent
          config={config}
          account={{ address: 'ben' }}
          locks={['abc123', 'def456']}
          addEvent={addEvent}
          loadEvent={loadEvent}
          now={now}
          event={event}
        />
      </Provider>
    )

    expect(form.getByDisplayValue('Test Event')).not.toBeNull()
    expect(form.getByDisplayValue('This is my test event')).not.toBeNull()
    expect(form.getByDisplayValue('Testville')).not.toBeNull()
  })
})

describe('mapStateToProps', () => {
  it('should return an array of locks owned by the current user when given a redux locks object', () => {
    expect.assertions(4)
    const props = mapStateToProps({ locks: inputLocks, account }, { now: null })

    expect(props.locks.length).toEqual(2)
    expect(props.locks[0]).toEqual('abc123')
    expect(props.locks[1]).toEqual('def456')
    expect(props.now).toBeInstanceOf(Date)
  })

  it('should pass through an event to props when given one in state', () => {
    expect.assertions(1)
    const props = mapStateToProps(
      { locks: inputLocks, event: 'foo', account },
      { now: null }
    )

    expect(props.event).toEqual('foo')
  })
})
