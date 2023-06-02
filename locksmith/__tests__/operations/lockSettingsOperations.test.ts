import { expect } from 'vitest'
import {
  getSettings,
  saveSettings,
} from '../../src/operations/lockSettingOperations'

describe('lockSettingsOperations', () => {
  it('should save and retrieve lock settings with protected data', async () => {
    expect.assertions(2)
    const lockAddress = '0x95de5F777A3e283bFf0c47374998E10D8A2183C7'
    const network = 5

    saveSettings({
      lockAddress,
      network,
      sendEmail: true,
      replyTo: 'exaple@gmail.com',
    })

    const settings = await getSettings({
      lockAddress,
      network,
      includeProtected: true,
    })

    expect(settings.replyTo).toBe('exaple@gmail.com')
    expect(settings.sendEmail).toBe(true)
  })

  it.only('correctly save and retrieve lock settings without protected data', async () => {
    expect.assertions(2)
    const lockAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
    const network = 5

    saveSettings({
      lockAddress,
      network,
      sendEmail: true,
      replyTo: 'exaple@gmail.com',
    })

    const settings = await getSettings({
      lockAddress,
      network,
    })

    expect(settings.replyTo).toBeUndefined()
    expect(settings.sendEmail).toBe(true)
  })
})
