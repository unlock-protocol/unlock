import React from 'react'
import { setError, SET_ERROR } from '../../actions/error'

describe('error actions', () => {
  it('should create an action to set the error', () => {
    const error = {
      message: <p>This is not right</p>,
    }
    const expectedAction = {
      type: SET_ERROR,
      error,
    }
    expect(setError(error)).toEqual(expectedAction)
  })
})
