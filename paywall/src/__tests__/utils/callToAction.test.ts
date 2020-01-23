import { PaywallCallToAction, KeyStatus } from '../../unlockTypes'
import { getCallToAction } from '../../utils/callToAction'

const ctas: PaywallCallToAction = {
  default: 'This is the default CTA',
  confirmed: 'This CTA is used when key is confirmed',
  pending: 'The Pending CTA',
  expired: 'This key is past its sell-by date',
  noWallet: 'You do not have a wallet',
}

const onlyDefaultCta: any = {
  default: 'There is only a default CTA here',
}

describe('callToAction utils', () => {
  describe('getCallToAction', () => {
    describe('when fields are defined', () => {
      it.each([KeyStatus.VALID, KeyStatus.CONFIRMING])(
        'Returns cta.confirmed for KeyStatus.%s',
        (s: KeyStatus) => {
          expect.assertions(1)
          expect(getCallToAction(ctas, s)).toEqual(ctas.confirmed)
        }
      )
      it.each([KeyStatus.PENDING, KeyStatus.SUBMITTED])(
        'Returns cta.pending for KeyStatus.%s',
        (s: KeyStatus) => {
          expect.assertions(1)
          expect(getCallToAction(ctas, s)).toEqual(ctas.pending)
        }
      )
      it.each([KeyStatus.EXPIRED])(
        'Returns cta.expired for KeyStatus.%s',
        (s: KeyStatus) => {
          expect.assertions(1)
          expect(getCallToAction(ctas, s)).toEqual(ctas.expired)
        }
      )

      // These all appear to be "unused" key statuses
      it.each([KeyStatus.NONE, KeyStatus.CONFIRMED, KeyStatus.FAILED])(
        'Returns cta.default for KeyStatus.%s',
        (s: KeyStatus) => {
          expect.assertions(1)
          expect(getCallToAction(ctas, s)).toEqual(ctas.default)
        }
      )
    })

    describe('when only ctas.default is defined', () => {
      it.each([
        KeyStatus.NONE,
        KeyStatus.CONFIRMING,
        KeyStatus.CONFIRMED,
        KeyStatus.EXPIRED,
        KeyStatus.VALID,
        KeyStatus.SUBMITTED,
        KeyStatus.PENDING,
        KeyStatus.FAILED,
      ])('Returns cta.default for KeyStatus.%s', (s: KeyStatus) => {
        expect.assertions(1)
        expect(getCallToAction(onlyDefaultCta, s)).toEqual(
          onlyDefaultCta.default
        )
      })
    })
  })
})
