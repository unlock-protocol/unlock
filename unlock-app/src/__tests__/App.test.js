import React from 'react'
import { shallow } from 'enzyme'
import App from '../App'

// Mock the provider
jest.mock('web3', () => {
  return {
    providers: {
      WebsocketProvider: class WebsocketProvider {},
    },
  }
})

// Mock the service
jest.mock('../services/web3Service', () => {
  return (function() {
    return {
      connect: () => {},
    }
  })
})

it('renders without crashing', () => {
  shallow(<App />)
})
