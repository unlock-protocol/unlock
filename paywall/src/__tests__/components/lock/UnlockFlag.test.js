import React from 'react'
import * as rtl from 'react-testing-library'
import { LockedFlag, UnlockedFlag } from '../../../components/lock/UnlockFlag'

let futureDate = new Date()
futureDate.setYear(2019)
futureDate.setMonth(4)
futureDate.setDate(3)
futureDate = futureDate.getTime() / 1000

describe('UnlockFlag component', () => {
  describe('LockedFlag', () => {
    it('should open the link in a new tab', () => {
      expect.assertions(1)
      let wrapper = rtl.render(<LockedFlag />)
      expect(wrapper.getByText('Unlock').target).toBe('_blank')
    })
  })

  it('should open the link in a new tab', () => {
    expect.assertions(1)
    let wrapper = rtl.render(<UnlockedFlag expiration="Next Week" />)

    expect(wrapper.getByText('Unlock').target).toBe('_blank')
  })
})
