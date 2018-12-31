import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import Button from '../../../components/interface/buttons/Button'
import DisabledButton from '../../../components/interface/buttons/DisabledButton'

jest.mock('next/link', () => {
  return ({ children }) => children
})

afterEach(rtl.cleanup)
describe('Button', () => {
  it('should activate the action function when clicked', () => {
    let buttonClicked = false
    const action = () => {
      buttonClicked = true
    }

    let wrapper = rtl.render(<Button action={action}>Click me</Button>)

    let button = wrapper.getByText('Click me')
    rtl.fireEvent.click(button)

    expect(buttonClicked).toEqual(true)
  })

  it('should not propagate click events', () => {
    let buttonClicked = false
    let wrapperClicked = false

    const buttonAction = () => {
      buttonClicked = true
    }
    const wrapperAction = () => {
      wrapperClicked = false
    }

    // role and onKeyDown action here are to comply with accessibility rules
    let wrapper = rtl.render(
      <div
        onClick={wrapperAction}
        onKeyDown={wrapperAction}
        role="presentation"
      >
        <Button action={buttonAction}>Click me</Button>
      </div>
    )

    let button = wrapper.getByText('Click me')
    rtl.fireEvent.click(button)

    expect(buttonClicked).toEqual(true)
    expect(wrapperClicked).toEqual(false)
  })
  it('should not run an action from a disabled button', () => {
    let buttonClicked = false

    const buttonAction = () => {
      buttonClicked = true
    }

    let wrapper = rtl.render(
      <DisabledButton action={buttonAction}>Click me</DisabledButton>
    )

    let button = wrapper.getByText('Click me')
    rtl.fireEvent.click(button)

    expect(buttonClicked).toEqual(false)
  })
})
