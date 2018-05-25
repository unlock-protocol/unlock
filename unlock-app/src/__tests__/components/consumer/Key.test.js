import React from 'react'
import { shallow } from 'enzyme'
import { Key } from '../../../components/consumer/Key'
import iframeServiceMock from '../../../services/iframeService'

jest.mock('../../../services/iframeService', () => {
  return {
    unlockIfKeyIsValid: jest.fn(),
  }
})

describe('Key Component', () => {

  const currentKey = {
    expiration: '10',
  }

  const wrapper = shallow(<Key currentKey={currentKey} />)

  it('shows the current key expiratin date', () => {
    expect(wrapper.text()).toContain(`Your key expires at ${currentKey.expiration}.`)
  })

  it('shows a button which closes the modal', () => {
    const closeButton = wrapper.find('button')
    expect(closeButton.text()).toEqual('Close')
  })

  it('calls unlockIfKeyIsValid when the close button is clicked', () => {
    const closeButton = wrapper.find('button')
    closeButton.simulate('click')
    expect(iframeServiceMock.unlockIfKeyIsValid).toHaveBeenCalledWith({ key: currentKey })
  })
})