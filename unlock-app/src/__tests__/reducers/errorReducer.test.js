import React from 'react'
import reducer from '../../reducers/errorReducer'
import { SET_ERROR } from '../../actions/error'
import { SET_PROVIDER } from '../../actions/provider'
import { SET_NETWORK } from '../../actions/network'

describe('error reducer', () => {
  const error = <p>Something was wrong</p>

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(null)
  })

  it('should return the initial state when receveing SET_PROVIDER', () => {
    expect(
      reducer(
        {
          error,
        },
        {
          type: SET_PROVIDER,
        }
      )
    ).toEqual(null)
  })

  it('should return the initial state when receveing SET_NETWORK', () => {
    expect(
      reducer(
        {
          error,
        },
        {
          type: SET_NETWORK,
        }
      )
    ).toEqual(null)
  })

  it('should set the error accordingly when receiving SET_ERROR', () => {
    expect(
      reducer(undefined, {
        type: SET_ERROR,
        error,
      })
    ).toEqual(error)
  })
})
