import React from 'react'
import * as rtl from 'react-testing-library'

import ShowWhenLocked from '../../../components/paywall/ShowWhenLocked'

describe('ShowWhenLocked', () => {
  describe('if there is a valid key', () => {
    it('should not show the children if not locked', () => {
      expect.assertions(1)

      jest.useFakeTimers()

      const wrapper = rtl.render(
        <ShowWhenLocked locked={false}>Show me</ShowWhenLocked>
      )

      jest.runAllTimers()

      expect(wrapper.queryByText('Show me')).toBeNull()
    })

    it('should show nothing if accounts are not loaded and 200ms has not elapsed (no flash)', () => {
      expect.assertions(1)

      jest.useFakeTimers()

      const wrapper = rtl.render(
        <ShowWhenLocked locked>Show me</ShowWhenLocked>
      )
      jest.advanceTimersByTime(199)

      expect(wrapper.queryByText('Show me')).toBeNull()
    })

    it('should show the children if there is a modal', () => {
      expect.assertions(1)

      jest.useFakeTimers()

      const wrapper = rtl.render(
        <ShowWhenLocked locked>Show me</ShowWhenLocked>
      )
      jest.runAllTimers()

      expect(wrapper.queryByText('Show me')).not.toBeNull()
    })
  })

  describe('if paywall state is locked', () => {
    it('should show the children', () => {
      expect.assertions(1)

      jest.useFakeTimers()
      const wrapper = rtl.render(
        <ShowWhenLocked locked>Show me</ShowWhenLocked>
      )
      jest.runAllTimers()

      expect(wrapper.queryByText('Show me')).not.toBeNull()
    })
  })
})
