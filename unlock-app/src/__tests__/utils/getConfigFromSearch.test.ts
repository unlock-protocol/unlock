import getPaywallConfigFromQuery from '../../utils/getConfigFromSearch'

let originalConsole: any
let error = jest.fn()

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

describe('getConfigFromSearch', () => {
  beforeAll(() => {
    originalConsole = global.console
  })
  beforeEach(() => {
    error = jest.fn()
    ;(global.console as any) = { error }
  })
  afterAll(() => {
    global.console = originalConsole
  })

  it('should be undefined if there is no paywall config', () => {
    expect.assertions(2)

    expect(getPaywallConfigFromQuery({})).toBeUndefined()
    expect(error).not.toHaveBeenCalled()
  })

  it('should be undefined if paywall config is malformed JSON', () => {
    expect.assertions(2)

    expect(getPaywallConfigFromQuery({ paywallConfig: '{' })).toBeUndefined()
    expect(error).toHaveBeenCalledWith(
      'paywall config in URL not valid JSON, continuing with undefined'
    )
  })

  it('should be undefined if paywall config does not pass validation', () => {
    expect.assertions(2)

    expect(getPaywallConfigFromQuery({ paywallConfig: '{}' })).toBeUndefined()
    expect(error).toHaveBeenCalledWith(
      'paywall config in URL does not pass validation, continuing with undefined'
    )
  })

  it('should return a paywall config otherwise', () => {
    expect.assertions(2)

    expect(
      getPaywallConfigFromQuery({
        paywallConfig: encodeURIComponent(JSON.stringify(validConfig)),
      })
    ).toEqual(
      expect.objectContaining({
        icon: 'http://image.com/image.tiff',
      })
    )
    expect(error).not.toHaveBeenCalled()
  })
})
