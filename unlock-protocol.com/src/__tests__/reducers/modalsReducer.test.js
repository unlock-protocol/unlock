import reducer from '../../reducers/modalsReducer'
import { SHOW_MODAL, HIDE_MODAL } from '../../actions/modal'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'

describe('modal reducer', () => {
  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect.assertions(1)
    expect(
      reducer(
        {
          '123': true,
          '456': true,
        },
        {
          type: SET_PROVIDER,
        }
      )
    ).toEqual({})
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect.assertions(1)
    expect(
      reducer(
        {
          '123': true,
          '456': true,
        },
        {
          type: SET_NETWORK,
        }
      )
    ).toEqual({})
  })

  it('should add the modal to the list of modals when receiving SHOW_MODAL', () => {
    expect.assertions(1)
    const modal = '123'
    expect(
      reducer(
        {},
        {
          type: SHOW_MODAL,
          modal,
        }
      )
    ).toEqual({
      '123': true,
    })
  })

  it('should not change the list of modals when receiving SHOW_MODAL again', () => {
    expect.assertions(1)
    const modal = '123'
    expect(
      reducer(
        {
          '123': true,
        },
        {
          type: SHOW_MODAL,
          modal,
        }
      )
    ).toEqual({
      '123': true,
    })
  })

  it('should remove the modal to the list of modals when receiving HIDE_MODAL', () => {
    expect.assertions(1)
    const modal = '123'
    expect(
      reducer(
        {
          '123': true,
        },
        {
          type: HIDE_MODAL,
          modal,
        }
      )
    ).toEqual({})
  })

  it('should not change the list of modals when receiving HIDE_MODAL for a missing modal', () => {
    expect.assertions(1)
    const modal = '456'
    expect(
      reducer(
        {
          '123': true,
        },
        {
          type: HIDE_MODAL,
          modal,
        }
      )
    ).toEqual({
      '123': true,
    })
  })
})
