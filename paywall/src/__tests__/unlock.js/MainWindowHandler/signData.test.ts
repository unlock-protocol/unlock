import FakeWindow from '../../test-helpers/fakeWindowHelpers'
import IframeHandler from '../../../unlock.js/IframeHandler'
import MainWindowHandler from '../../../unlock.js/MainWindowHandler'
import { SIGN_DATA_NAMESPACE } from '../../../constants'
import { PostMessages } from '../../../messageTypes'

describe('MainWindowHandler - signData', () => {
  let fakeWindow: FakeWindow
  let iframes: IframeHandler
  let handler: MainWindowHandler

  beforeAll(() => {
    fakeWindow = new FakeWindow()
    iframes = new IframeHandler(fakeWindow, 'http://t', 'http://u', 'http://v')
    handler = new MainWindowHandler(fakeWindow, iframes)
    handler.setupUnlockProtocolVariable()
    handler.init()
  })

  describe('handling messages', () => {
    it('should fire a callback in response to PostMessages.PERSONAL_SIGN_RESULT', () => {
      expect.assertions(1)
      const callback = jest.fn()
      ;(fakeWindow as any).unlockProtocol.signData('some data', callback)

      iframes.data.emit(PostMessages.PERSONAL_SIGN_RESULT, {
        signedData: 'some signed data',
        callbackId: SIGN_DATA_NAMESPACE + '0', // assumption that first signData callback will have index 0
      })

      expect(callback).toHaveBeenCalledWith('some signed data')
    })
  })
})
