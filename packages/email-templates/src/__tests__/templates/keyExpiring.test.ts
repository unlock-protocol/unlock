// @vitest-environment jsdom

import keyExpiring from '../../templates/keyExpiring'
import { prepareAll } from '../../templates/prepare'
import { expect, it, describe } from 'vitest'
import { asHtml } from '../utils'

const DETAILS = {
  keyId: '1337',
  lockName: 'Ethereal NYC 202',
  keychainUrl: 'https://app.unlock-protocol.com/keychain',
  network: 'Polygon',
}
describe('keyExpiring', () => {
  it('should have the right subject', () => {
    expect.assertions(1)
    expect(
      prepareAll(keyExpiring).subject({
        ...DETAILS,
      })
    ).toBe(`Your "Ethereal NYC 202" membership is about to expire!`)
  })

  it('should correct text when isRenewable', () => {
    expect.assertions(1)

    const content = prepareAll(keyExpiring).html({
      ...DETAILS,
      isRenewable: true,
    })

    expect(asHtml(content).textContent).toContain(
      `You can renew this membership from the Unlock Keychain so you don't lose any benefit.`
    )
  })

  it('should not show text when is not isRenewable', () => {
    expect.assertions(1)
    const content = prepareAll(keyExpiring).html({
      ...DETAILS,
      isRenewable: false,
    })

    expect(asHtml(content).textContent).not.toContain(
      `You can renew this membership from the Unlock Keychain so you don't lose any benefit.`
    )
  })

  it('should correct text when isAutoRenewable', () => {
    expect.assertions(1)

    const content = prepareAll(keyExpiring).html({
      ...DETAILS,
      isAutoRenewable: true,
      currency: 'STR',
    })

    expect(asHtml(content).textContent).toContain(
      `This membership will automatically renew, since your balance of STR is enough. You can cancel this renewal from the Unlock Keychain.`
    )
  })

  it('should not show text when is not isAutoRenewable', () => {
    expect.assertions(1)
    const content = prepareAll(keyExpiring).html({
      ...DETAILS,
      isAutoRenewable: false,
      currency: 'STR',
    })

    expect(asHtml(content).textContent).not.toContain(
      `This membership will automatically renew, since your balance of STR is enough. You can cancel this renewal from the Unlock Keychain`
    )
  })

  it('should correct text when isRenewableIfRePurchased', () => {
    expect.assertions(1)

    const content = prepareAll(keyExpiring).html({
      ...DETAILS,
      isRenewableIfRePurchased: true,
    })

    expect(asHtml(content).textContent).toContain(
      `This membership will not automatically renew because the membership contract terms have changed. You can approve the new terms from the Unlock Keychain so you don't lose any benefit.`
    )
  })

  it('should not show text when is not isRenewableIfRePurchased', () => {
    expect.assertions(1)
    const content = prepareAll(keyExpiring).html({
      ...DETAILS,
      isRenewableIfRePurchased: false,
    })

    expect(asHtml(content).textContent).not.toContain(
      `This membership will not automatically renew because the membership contract terms have changed. You can approve the new terms from the Unlock Keychain so you don't lose any benefit.`
    )
  })

  it('should correct text when isRenewableIfReApproved', () => {
    expect.assertions(1)

    const content = prepareAll(keyExpiring).html({
      ...DETAILS,
      isRenewableIfReApproved: true,
      currency: 'STR',
    })

    expect(asHtml(content).textContent).toContain(
      `This membership will not automatically renew because you have not approved enough STR. You can approve renewals from the Unlock Keychain so you don't lose any benefit.`
    )
  })

  it('should not show text when is not isRenewableIfReApproved', () => {
    expect.assertions(1)
    const content = prepareAll(keyExpiring).html({
      ...DETAILS,
      isRenewableIfReApproved: false,
      currency: 'STR',
    })

    expect(asHtml(content).textContent).not.toContain(
      `This membership will not automatically renew because you have not approved enough STR. You can approve renewals from the Unlock Keychain so you don't lose any benefit.`
    )
  })
})
