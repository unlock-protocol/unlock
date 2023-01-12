import { App, launch } from './../helper'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

const Lock = {
  name: 'TestLock e2e',
  duration: '25',
  price: '0.05',
  quantity: '1000',
}
describe('Create Lock', () => {
  let app: App
  let page: any
  let metamask: any

  beforeAll(async () => {
    app = await launch()
    page = app.page
    metamask = app.metamask
  })

  afterAll(async () => {
    await app.stop()
  })

  it('Successfully create lock', async () => {
    await page.goto(app.url('/locks/create'), {
      waitUntil: 'networkidle',
    })

    await app.connect()

    await page.waitForTimeout(250)

    const $name = await page.$('[data-testid="name"]')
    const $expirationDuration = await page.$(
      '[data-testid="expirationDuration"]'
    )
    const $maxNumberOfKeys = await page.$('[data-testid="maxNumberOfKeys"]')

    const $keyPrice = await page.$('[data-testid="keyPrice"]')
    const $nextButton = await page.$('[data-testid="next-button"]')

    expect($name).toBeDefined()
    expect($expirationDuration).toBeDefined()
    expect($maxNumberOfKeys).toBeDefined()
    expect($keyPrice).toBeDefined()

    // fill create lock form and go to next steo
    await $name.type(Lock.name)
    await $expirationDuration.type(Lock.duration)
    await $maxNumberOfKeys.type(Lock.quantity)
    await $keyPrice.type(Lock.price)

    await page.waitForTimeout(1500)
    await $nextButton.click()

    // confirm lock creation
    const $confirm = await page.$('[data-testid="confirm-lock-creation"]')
    await $confirm.click()

    await page.waitForTimeout(1000)
    await metamask.confirmTransaction()
    await page.bringToFront()
  })
})
