import React from 'react'
import * as rtl from 'react-testing-library'
import { SHOW_MODAL } from '../../../actions/modal'

import {
  mapDispatchToProps,
  mapStateToProps,
  ShowUnlessUserHasKeyToAnyLock,
} from '../../../components/lock/ShowUnlessUserHasKeyToAnyLock'

describe('ShowUnlessUserHasKeyToAnyLock', () => {
  describe('if there is a valid key', () => {
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

    it('should show the children if there is a modal', () => {
      expect.assertions(1)
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

      expect(wrapper.queryByText('Show me')).not.toBe(null)
    })
  })

  describe('if there is no valid key', () => {
    it('should show the children', () => {
      expect.assertions(1)
      const keys = []
      const wrapper = rtl.render(
        <ShowUnlessUserHasKeyToAnyLock keys={keys} modalShown>
          Show me
        </ShowUnlessUserHasKeyToAnyLock>
      )

      expect(wrapper.queryByText('Show me')).not.toBe(null)
    })

    it('should invoke showModal if no modal exists', () => {
      expect.assertions(1)
      const keys = []
      const showModal = jest.fn()

      rtl.render(
        <ShowUnlessUserHasKeyToAnyLock
          keys={keys}
          modalShown={false}
          showModal={showModal}
        >
          Show me
        </ShowUnlessUserHasKeyToAnyLock>
      )

      expect(showModal).toHaveBeenCalled()
    })
  })

  describe('mapDispatchToProps', () => {
    it('should yield a prop function which dispatches showModal with the right value', () => {
      const locks = [
        {
          address: '0x123',
        },
        {
          address: '0x456',
        },
      ]
      const dispatch = jest.fn()
      const props = mapDispatchToProps(dispatch, { locks })
      props.showModal()
      expect(dispatch).toHaveBeenCalledWith({
        modal: '0x123-0x456',
        type: SHOW_MODAL,
      })
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
