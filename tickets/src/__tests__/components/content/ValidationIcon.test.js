import React from 'react'
import * as rtl from 'react-testing-library'
import { ValidationIcon } from '../../../components/content/validate/ValidationIcon'

describe('ValidationIcon', () => {
  it('should display a valid notice when the valid property is set to true', () => {
    expect.assertions(1)

    const wrapper = rtl.render(<ValidationIcon valid />)

    expect(wrapper.getByText('Ticket Valid')).not.toBeNull()
  })
  it('should display an invalid notice when the valid property is set to false', () => {
    expect.assertions(1)

    const wrapper = rtl.render(<ValidationIcon valid={false} />)

    expect(wrapper.getByText('Ticket Not Valid')).not.toBeNull()
  })
  it('should display a validating notice when the valid property is not set yet', () => {
    expect.assertions(1)

    const wrapper = rtl.render(<ValidationIcon valid={null} />)

    expect(wrapper.getByText('Ticket Validating')).not.toBeNull()
  })
})
