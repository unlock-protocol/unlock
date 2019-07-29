import React from 'react'
import * as rtl from 'react-testing-library'

import ShowWhenUnlocked from '../../../components/paywall/ShowWhenUnlocked'

describe('ShowWhenUnlocked', () => {
  describe('if the paywall state is unlocked', () => {
    it('should show the children', () => {
      expect.assertions(1)

      const wrapper = rtl.render(
        <ShowWhenUnlocked locked={false}>Show me</ShowWhenUnlocked>
      )

      expect(wrapper.queryByText('Show me')).not.toBeNull()
    })
  })

  describe('if paywall state is locked', () => {
    it('should not show the children', () => {
      expect.assertions(1)

      jest.useFakeTimers()
      const wrapper = rtl.render(
        <ShowWhenUnlocked locked>Show me</ShowWhenUnlocked>
      )
      jest.runAllTimers()

      expect(wrapper.queryByText('Show me')).toBeNull()
    })
  })
})
