import React from 'react'
import { shallow } from 'enzyme'
import App from '../App'

// Mock the service
jest.mock('../services/web3Service', () => {
  return (function() {
    return {
      connect: () => {
        return new Promise((resolve, reject) => {
          return resolve()
        })
      },
    }
  })
})

it('renders without crashing', () => {
  shallow(<App />)
})
