import React from 'react'
import * as rtl from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import DisabledButton from '../../../components/interface/buttons/DisabledButton'

jest.mock('next/link', () => {
  return ({ children }) => children
})

afterEach(rtl.cleanup)
describe('Button', () => {
  it('should not run an action from a disabled button', () => {
    expect.assertions(1)
    let buttonClicked = false

    const buttonAction = () => {
      buttonClicked = true
    }

    const wrapper = rtl.render(
      <DisabledButton action={buttonAction}>Click me</DisabledButton>
    )

    const button = wrapper.getByText('Click me')
    rtl.fireEvent.click(button)

    expect(buttonClicked).toEqual(false)
  })
})
