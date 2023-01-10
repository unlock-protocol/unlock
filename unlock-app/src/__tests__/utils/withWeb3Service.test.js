import React from 'react'
import * as rtl from '@testing-library/react'
import withWeb3Service, {
  Web3ServiceContext,
} from '../../utils/withWeb3Service'

const Web3ServiceProvider = Web3ServiceContext.Provider

// todo: fix
describe.skip('withWeb3Service', () => {
  it('should return a component which has access to the web3Service', () => {
    expect.assertions(1)
    // eslint-disable-next-line react/prop-types
    const Component = ({ web3Service }) => {
      return (
        <p>{web3Service ? 'has web3 service' : 'does not have web3 service'}</p>
      )
    }
    const ComponentWithWeb3Service = withWeb3Service(Component)
    const mockWeb3Service = {}
    const wrapper = rtl.render(
      <Web3ServiceProvider value={mockWeb3Service}>
        <ComponentWithWeb3Service />
      </Web3ServiceProvider>
    )
    expect(wrapper.getByText('has web3 service')).not.toBeNull()
  })
})
