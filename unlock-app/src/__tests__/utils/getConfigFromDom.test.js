import getConfigFromDom from '../../utils/getConfigFromDom'

const lock = '0x1234567890123456789012345678901234567890'
const validConfig = {
  callToAction: {
    default: 'hi',
    expired: 'there',
    pending: 'pending',
    confirmed: 'confirmed',
  },
  locks: {
    [lock]: {
      name: 'A Lock',
    },
  },
  icon: 'http://image.com/image.tiff',
}

describe('getConfigFromDom', () => {
  afterEach(() => {
    delete global.__unlockPaywalConfig__
  })

  it('should be undefined if there is no paywall config', () => {
    expect.assertions(1)

    expect(getConfigFromDom()).toBeUndefined()
  })

  it('should be undefined if paywall config does not pass validation', () => {
    expect.assertions(1)

    global.__unlockPaywalConfig__ = { not: 'a valid config' }

    expect(getConfigFromDom()).toBeUndefined()
  })

  it('should return a paywall config otherwise', () => {
    expect.assertions(1)

    global.__unlockPaywalConfig__ = validConfig

    expect(getConfigFromDom()).toEqual(
      expect.objectContaining({
        icon: 'http://image.com/image.tiff',
      })
    )
  })
})
