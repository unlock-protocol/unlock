import React from 'react'
import * as rtl from 'react-testing-library'
import { lockPage, unlockPage } from '../../../services/iframeService'

import {
  mapStateToProps,
  ShowUnlessUserHasKeyToAnyLock,
} from '../../../components/lock/ShowUnlessUserHasKeyToAnyLock'

jest.mock('../../../services/iframeService.js')

describe('ShowUnlessUserHasKeyToAnyLock', () => {
  describe('if there is a valid key', () => {
    it('should call the iframeService unlockPage', () => {
      expect.assertions(1)
      const keys = [
        {
          id: 'keyId',
          lock: '0xLock',
          owner: '0x123',
        },
      ]

      rtl.render(
        <ShowUnlessUserHasKeyToAnyLock keys={keys} modalShown={false}>
          Show me
        </ShowUnlessUserHasKeyToAnyLock>
      )

      expect(unlockPage).toHaveBeenCalledWith()
    })

    it('should not show the children if there is no modal', () => {
      expect.assertions(1)
      const keys = [
        {
          id: 'keyId',
          lock: '0xLock',
          owner: '0x123',
        },
      ]

      const wrapper = rtl.render(
        <ShowUnlessUserHasKeyToAnyLock keys={keys} modalShown={false}>
          Show me
        </ShowUnlessUserHasKeyToAnyLock>
      )

      expect(wrapper.queryByText('Show me')).toBeNull()
    })

    it('should show nothing if accounts are not loaded and 200ms has not elapsed (no flash)', () => {
      expect.assertions(1)

      jest.useFakeTimers()

      const keys = [
        {
          id: 'keyId',
          lock: '0xLock',
          owner: '0x123',
        },
      ]

      const wrapper = rtl.render(
        <ShowUnlessUserHasKeyToAnyLock keys={keys} modalShown>
          Show me
        </ShowUnlessUserHasKeyToAnyLock>
      )
      jest.advanceTimersByTime(199)

      expect(wrapper.queryByText('Show me')).toBe(null)
    })

    it('should show the children if there is a modal', () => {
      expect.assertions(1)

      jest.useFakeTimers()
      const keys = [
        {
          id: 'keyId',
          lock: '0xLock',
          owner: '0x123',
        },
      ]

      const wrapper = rtl.render(
        <ShowUnlessUserHasKeyToAnyLock keys={keys} modalShown>
          Show me
        </ShowUnlessUserHasKeyToAnyLock>
      )
      jest.runAllTimers()

      expect(wrapper.queryByText('Show me')).not.toBe(null)
    })
  })

  describe('if there is no valid key', () => {
    it('should show the children', () => {
      expect.assertions(1)

      jest.useFakeTimers()
      const keys = []
      const wrapper = rtl.render(
        <ShowUnlessUserHasKeyToAnyLock keys={keys} modalShown>
          Show me
        </ShowUnlessUserHasKeyToAnyLock>
      )
      jest.runAllTimers()

      expect(wrapper.queryByText('Show me')).not.toBe(null)
    })

    it('should call the iframeService lockPage', () => {
      expect.assertions(1)
      const keys = []

      rtl.render(
        <ShowUnlessUserHasKeyToAnyLock keys={keys}>
          Show me
        </ShowUnlessUserHasKeyToAnyLock>
      )

      expect(lockPage).toHaveBeenCalledWith()
    })
  })

  describe('mapStateToProps', () => {
    it('should include valid keys', () => {
      const locks = [
        {
          address: '0x123',
        },
        {
          address: '0x456',
        },
        {
          address: '0x789',
        },
      ]
      const now = new Date().getTime() / 1000
      const keys = {
        first: {
          id: 'first',
          lock: '0x123',
          expiration: now + 10,
        },
        second: {
          id: 'second',
          lock: '0x123',
          expiration: 0,
        },
        third: {
          id: 'third',
          lock: '0x456',
          expiration: now + 10,
        },
        fourth: {
          id: 'fourth',
          lock: '0x000',
          expiration: now + 10,
        },
      }

      const props = mapStateToProps(
        {
          keys,
          modals: {},
        },
        {
          locks,
        }
      )

      expect(props.keys.length).toBe(2)
      expect(props.keys[0].id).toBe('first')
      expect(props.keys[1].id).toBe('third')
    })

    it('should include modalShown as true if a modal is shown', () => {
      const locks = [
        {
          address: '0x123',
        },
        {
          address: '0x456',
        },
      ]

      const props = mapStateToProps(
        {
          keys: {},
          modals: {
            '0x123-0x456': true,
          },
        },
        {
          locks,
        }
      )
      expect(props.modalShown).toBe(true)
    })

    it('should include modalShown as false if a modal is not shown', () => {
      const locks = [
        {
          address: '0x123',
        },
        {
          address: '0x456',
        },
      ]

      const props = mapStateToProps(
        {
          keys: {},
          modals: {
            '0x123-0x789': true,
          },
        },
        {
          locks,
        }
      )
      expect(props.modalShown).toBe(false)
    })
  })
})
