import React from 'react'
import * as rtl from '@testing-library/react'

import Button from '../../../components/interface/buttons/Button'

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
})
