import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import { LockButton } from '../../../components/interface/buttons/Button'

jest.mock('next/link', () => {
  return ({children}) => children
})

afterEach(rtl.cleanup)
describe('Button', () => {

  it ('should activate the action function when clicked', () => {

    let buttonClicked = false
    const action = () => {
      buttonClicked = true
    }

    let wrapper = rtl.render(
      <LockButton action={action}>
        Click me
      </LockButton>
    )

    let button = wrapper.getByText('Click me')
    rtl.fireEvent.click(button)

    expect(buttonClicked).toEqual(true)

  })

  it ('should not propagate click events', () => {

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
      <div onClick={wrapperAction} onKeyDown={wrapperAction} role="presentation">
        <LockButton action={buttonAction}>
          Click me
        </LockButton>
      </div>
    )

    let button = wrapper.getByText('Click me')
    rtl.fireEvent.click(button)

    expect(buttonClicked).toEqual(true)
    expect(wrapperClicked).toEqual(false)

  })

})
