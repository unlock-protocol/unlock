import React from 'react'
import * as rtl from 'react-testing-library'

import { CreateEventButton } from '../../../components/content/create/CreateEventButton'

describe('CreateEventButton', () => {
  it('should display the submit button when submitted is false', () => {
    expect.assertions(1)
    const wrapper = rtl.render(<CreateEventButton />)
    expect(wrapper.getByText('Save Event')).not.toBeNull()
  })

  it('should display the submitted button when submitted is true', () => {
    expect.assertions(1)
    const wrapper = rtl.render(<CreateEventButton submitted />)
    expect(wrapper.getByText('Saving...')).not.toBeNull()
  })

  it('should display the saved button when submitted is true', () => {
    expect.assertions(1)
    const wrapper = rtl.render(<CreateEventButton saved />)
    expect(wrapper.getByText('Event Saved')).not.toBeNull()
  })
})
