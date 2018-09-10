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
    expiration: Math.floor(new Date().getTime()/1000) + 1000,
  }

  const setTransaction = jest.fn()

  const wrapper = shallow(<Key currentKey={currentKey} setTransaction={setTransaction} />)

  it('shows the current key expiratin date', () => {
    expect(wrapper.text()).toContain('Your key expires in')
    expect(wrapper.find('Duration').props()).toEqual({
      seconds: '1000',
    })
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

  it('unsets the transaction when closed', () => {
    const closeButton = wrapper.find('button')
    closeButton.simulate('click')
    expect(setTransaction).toHaveBeenCalledWith(null)
  })
})
