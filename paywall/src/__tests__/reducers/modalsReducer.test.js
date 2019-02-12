import reducer from '../../reducers/modalsReducer'
import { SHOW_MODAL, HIDE_MODAL } from '../../actions/modal'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'

describe('modal reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
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
