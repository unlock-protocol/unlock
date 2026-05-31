import { HookType } from '@unlock-protocol/types'
import {
  getAccessCodeHookAddress,
  getAccessCodeHookType,
} from '../../utils/accessCodes'

describe('access code helpers', () => {
  it('uses promo code hooks for paid locks and password hooks for free locks', () => {
    expect(getAccessCodeHookType(true)).toBe(HookType.PROMO_CODE_CAPPED)
    expect(getAccessCodeHookType(false)).toBe(HookType.PASSWORD_CAPPED)
  })

  it('finds the paid-lock access code hook address', () => {
    expect(
      getAccessCodeHookAddress(
        {
          hooks: {
            onKeyPurchaseHook: [
              {
                id: HookType.PASSWORD_CAPPED,
                name: 'Password',
                address: '0x0000000000000000000000000000000000000001',
              },
              {
                id: HookType.PROMO_CODE_CAPPED,
                name: 'Promo codes',
                address: '0x0000000000000000000000000000000000000002',
              },
            ],
          },
        },
        true
      )
    ).toBe('0x0000000000000000000000000000000000000002')
  })

  it('finds the free-lock access code hook address', () => {
    expect(
      getAccessCodeHookAddress(
        {
          hooks: {
            onKeyPurchaseHook: [
              {
                id: HookType.PROMO_CODE_CAPPED,
                name: 'Promo codes',
                address: '0x0000000000000000000000000000000000000002',
              },
              {
                id: HookType.PASSWORD_CAPPED,
                name: 'Password',
                address: '0x0000000000000000000000000000000000000001',
              },
            ],
          },
        },
        false
      )
    ).toBe('0x0000000000000000000000000000000000000001')
  })

  it('returns an empty address when the network has no matching access code hook', () => {
    expect(getAccessCodeHookAddress(undefined, true)).toBe('')
    expect(getAccessCodeHookAddress({ hooks: {} }, false)).toBe('')
  })
})
