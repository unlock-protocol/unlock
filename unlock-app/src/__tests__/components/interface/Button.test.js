import React from 'react'
import * as rtl from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import Button from '../../../components/interface/buttons/Button'
import DisabledButton from '../../../components/interface/buttons/DisabledButton'

jest.mock('next/link', () => {
  return ({ children }) => children
})

afterEach(rtl.cleanup)
describe('Button', () => {
  it('should activate the action function when clicked', () => {
    expect.assertions(1)
    let buttonClicked = false
    const action = () => {
      buttonClicked = true
    }

    const wrapper = rtl.render(<Button action={action}>Click me</Button>)

    const button = wrapper.getByText('Click me')
    rtl.fireEvent.click(button)

    expect(buttonClicked).toEqual(true)
  })

  it('should not propagate click events', () => {
    expect.assertions(2)
    let buttonClicked = false
    let wrapperClicked = false

    const buttonAction = () => {
      buttonClicked = true
    }
    const wrapperAction = () => {
      wrapperClicked = false
    }

    // role and onKeyDown action here are to comply with accessibility rules
    const wrapper = rtl.render(
      <div
        onClick={wrapperAction}
        onKeyDown={wrapperAction}
        role="presentation"
      >
        <Button action={buttonAction}>Click me</Button>
      </div>
    )

    const button = wrapper.getByText('Click me')
    rtl.fireEvent.click(button)

    expect(buttonClicked).toEqual(true)
    expect(wrapperClicked).toEqual(false)
  })

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
