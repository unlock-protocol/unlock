import reducer, { initialState } from '../../reducers/lockFormVisibilityReducer'
import { SHOW_FORM, HIDE_FORM } from '../../actions/lockFormVisibility'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'
import { SET_ACCOUNT } from '../../actions/accounts'

describe('lock form visibility reducer', () => {
  it('should return the initial state', () => {
    expect.assertions(1)
    expect(reducer(undefined, { type: 'aaa' })).toEqual(initialState)
  })

  it('should return the initial state when receiving SET_PROVIDER', () => {
    expect.assertions(1)
    expect(reducer({ visible: true }, { type: SET_PROVIDER })).toEqual(
      initialState
    )
  })

  it('should return the initial state when receiving SET_NETWORK', () => {
    expect.assertions(1)
    expect(reducer({ visible: true }, { type: SET_NETWORK })).toEqual(
      initialState
    )
  })

  it('should return the initial state when receiving SET_ACCOUNT', () => {
    expect.assertions(1)
    expect(reducer({ visible: true }, { type: SET_ACCOUNT })).toEqual(
      initialState
    )
  })

  it('should show the form', () => {
    expect.assertions(1)
    expect(reducer(initialState, { type: SHOW_FORM })).toEqual({
      visible: true,
    })
  })

  it('should hide the form', () => {
    expect.assertions(1)
    expect(reducer({ visible: true }, { type: HIDE_FORM })).toEqual({
      visible: false,
    })
  })
})
