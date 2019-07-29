import React from 'react'
import * as rtl from 'react-testing-library'
import {
  LockedFlag,
  UnlockedFlag,
} from '../../../components/paywall/UnlockFlag'

let futureDate: Date | number = new Date()
futureDate.setFullYear(2019)
futureDate.setMonth(4)
futureDate.setDate(3)
futureDate = futureDate.getTime() / 1000

interface HTMLElementWithTarget extends HTMLElement {
  target: string
}

describe('UnlockFlag component', () => {
  describe('LockedFlag', () => {
    it('should open the link in a new tab', () => {
      expect.assertions(1)
      let wrapper = rtl.render(<LockedFlag />)
      const UnlockElement = wrapper.getByText('Unlock') as HTMLElementWithTarget
      expect(UnlockElement.target).toBe('_blank')
    })
  })

  it('should open the link in a new tab', () => {
    expect.assertions(1)
    let wrapper = rtl.render(<UnlockedFlag expiration="Next Week" />)

    const UnlockElement = wrapper.getByText('Unlock') as HTMLElementWithTarget
    expect(UnlockElement.target).toBe('_blank')
  })
})
