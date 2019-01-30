import React from 'react'
import * as rtl from 'react-testing-library'
import { lockPage, unlockPage } from '../../../services/iframeService'

import IframeService from '../../../components/lock/IframeService'

jest.mock('../../../services/iframeService.js')

describe('IframeService', () => {
  describe('if there is a valid key', () => {
    it('should call the iframeService unlockPage', () => {
      expect.assertions(1)
      const keys = [
        {
          id: 'keyId',
          lock: '0xLock',
          owner: '0x123',
        },
      ]

      rtl.render(<IframeService keys={keys} modalShown={false} />)

      expect(unlockPage).toHaveBeenCalled()
    })
    it('should call the iframeService lockPage if modalShown', () => {
      expect.assertions(1)
      const keys = [
        {
          id: 'keyId',
          lock: '0xLock',
          owner: '0x123',
        },
      ]

      rtl.render(<IframeService keys={keys} modalShown />)

      expect(lockPage).toHaveBeenCalled()
    })
  })

  describe('if there is no valid key', () => {
    it('should call the iframeService lockPage', () => {
      expect.assertions(1)
      const keys = []

      rtl.render(<IframeService keys={keys} />)

      expect(lockPage).toHaveBeenCalledWith()
    })
  })
})
