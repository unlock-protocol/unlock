import React from 'react'
import reducer from '../../reducers/errorReducer'
import { SET_ERROR } from '../../actions/error'

describe('error reducer', () => {

  const error = (<p>Something was wrong</p>)

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(null)
  })

  it('should set the error accordingly when receiving SET_ERROR', () => {
    expect(reducer(undefined, {
      type: SET_ERROR,
      error,
    })).toEqual(error)
  })

})
