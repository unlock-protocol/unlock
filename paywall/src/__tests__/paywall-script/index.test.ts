import { Paywall } from '../../paywall-script/index'

const paywallConfig = {
  callToAction: {
    default: 'default',
    expired: 'expired',
    pending: 'pending',
    confirmed: 'confirmed',
  },
  locks: {
    '0x1234567890123456789012345678901234567890': {
      name: 'A Lock',
    },
  },
  icon: 'http://com.com/image.tiff',
}

const paywall = new Paywall(paywallConfig)

describe('Paywall init script', () => {
  it('is constructed with one call in the buffer to set the config', () => {
    expect.assertions(2)

    expect(paywall.childCallBuffer).toHaveLength(1)

    expect(paywall.childCallBuffer[0]).toEqual(['setConfig', paywallConfig])
  })
})
