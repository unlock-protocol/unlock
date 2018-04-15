import React from 'react'
import ReactDOM from 'react-dom'
import App from '../App'

jest.mock('../services/web3Service', () => {
  return {
    initWeb3Service: () => {

    }
  }
})

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<App />, div)
  ReactDOM.unmountComponentAtNode(div)
})
