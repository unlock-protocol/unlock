const url = require('../helpers/url').main
const wait = require('../helpers/wait')
const dashboard = require('../helpers/dashboard')

describe('The Unlock Dashboard', () => {
  beforeAll(async () => {
    await page.goto(url('/dashboard'), { waitUntil: 'networkidle2' })
    await wait.forLoadingDone()
  })

  it('should load the creator dashboard', async () => {
    expect.assertions(1)
    await expect(page).toMatch('Creator Dashboard')
  })

  it('should list the address of the current user', async () => {
    expect.assertions(1)
    await page.waitForSelector('#UserAddress')
    const userAddress = await page.$eval('#UserAddress', e => e.innerText)
    await expect(userAddress).toMatch(
      '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
    )
  })

  it('should have a button allowing the creation of a Lock', async () => {
    expect.assertions(1)
    const createLockButton = await page.waitFor('#CreateLockButton')
    await expect(createLockButton).toMatch('Create Lock')
  })

  describe('Lock creation', () => {
    let existingLocks
    let newLock

    beforeAll(async () => {
      existingLocks = await dashboard.listLocks()
    })

    it('should display the lock creation form', async () => {
      expect.assertions(4)
      await expect(page).toClick('button', { text: 'Create Lock' })
      await expect(page).toMatch('Submit')
      await expect(page).toMatch('Cancel')
      await expect(page).toMatch('days')
    })

    // This test requires the test above to have been executed and pass
    it('should persist the lock', async () => {
      expect.assertions(11)
      const name = `My lock ${Math.random()
        .toString(36)
        .substring(7)}`
      const expirationDuration =
        Math.floor(1000 * Math.random()).toString(10) + 1
      const maxNumberOfKeys = Math.floor(100000 * Math.random()).toString(10)
      const keyPrice = (Math.floor(990 * Math.random()) / 100.0).toString(10) // we want key prices less than 10 Eth

      await expect(page).toFill('input[name="name"]', name)
      await expect(page).toFill(
        'input[name="expirationDuration"]',
        expirationDuration
      )
      await expect(page).toFill(
        'input[name="maxNumberOfKeys"]',
        maxNumberOfKeys
      )
      await expect(page).toFill('input[name="keyPrice"]', keyPrice)
      await expect(page).toClick('button', { text: 'Submit' })
      await wait.untilIsGone('.lockForm')

      // List all locks (there should be a new one)
      const locks = await dashboard.listLocks()
      expect(locks.length).toBe(existingLocks.length + 1)

      // This is the new lock
      newLock = locks.find(lock => {
        return !existingLocks.includes(lock)
      })
      // Get the locks' innerText
      const lockText = await page.evaluate(address => {
        return document.querySelector(`[data-address="${address}"]`).innerText
      }, newLock)
      await expect(lockText).toMatch(name)
      await expect(lockText).toMatch(`${expirationDuration} day`) // we use day as this could be singular!
      await expect(lockText).toMatch(`0/${maxNumberOfKeys}`)
      await expect(lockText).toMatch(keyPrice)
      await expect(lockText).toMatch(/Confirming|Submitted/) // The lock is either submitted or confirming (depending on when the mining happens in the tests)
    })

    // This test requires the test above
    it('should be confirming after having been submitted', async () => {
      expect.assertions(1)
      await wait.untilIsFalse(address => {
        return document
          .querySelector(`[data-address="${address}"]`)
          .innerText.includes('Submitted')
      }, newLock)

      // The lock should now be "confirming"
      const lockText = await page.evaluate(address => {
        return document.querySelector(`[data-address="${address}"]`).innerText
      }, newLock)

      await expect(lockText).toMatch('Confirming')

      await wait.untilIsFalse(address => {
        return document
          .querySelector(`[data-address="${address}"]`)
          .innerText.includes('Confirming')
      }, newLock)
    })
  })

  describe('On existing Locks', () => {
    let lockSelector

    beforeAll(async () => {
      await wait.forLoadingDone()
      const existingLocks = await dashboard.listLocks()
      lockSelector = `[data-address="${existingLocks[0]}"]`
      // Let's make sure the lock is not pending!
      await wait.untilIsFalse(_lockSelector => {
        return document
          .querySelector(_lockSelector)
          .innerText.includes('Submitted')
      }, lockSelector)

      await wait.untilIsFalse(_lockSelector => {
        return document
          .querySelector(_lockSelector)
          .innerText.includes('Confirming')
      }, lockSelector)
    })

    describe('Data existing after refresh', () => {
      it('should retain the lock address, key price, duration and maximum number of keys', async () => {
        expect.assertions(1)
        await page.reload({ waitUntil: 'networkidle2' })
        await wait.forLoadingDone()
        await expect(page).toMatchElement(lockSelector)
      })
    })

    describe('Lock Embed Code', () => {
      it('should toggle the embed code', async () => {
        expect.assertions(2)
        await page.waitForSelector(lockSelector)
        await expect(page).toClick(`${lockSelector} button[title="Embed"]`)
        await expect(page).toMatch('Code snippet')
      })

      it('has a Preview lock link', async () => {
        expect.assertions(1)
        await expect(page).toMatchElement(`${lockSelector} a[title="Preview"]`)
      })
    })

    describe('Lock Editing', () => {
      let lockToEditSelector
      beforeEach(async () => {
        const existingLocks = await dashboard.listLocks()
        lockToEditSelector = `[data-address="${existingLocks[0]}"]`
      })

      it('a button exists to edit the Lock details', async () => {
        expect.assertions(1)
        await expect(page).toMatchElement(
          `${lockToEditSelector} button[title="Edit"]`
        )
      })

      it('allows the lock owner to update the price of the lock', async () => {
        expect.assertions(5)
        await expect(page).toClick(`${lockToEditSelector} button[title="Edit"]`)
        const keyPriceInputSelector = 'input[name="keyPrice"]'
        await expect(page).toMatchElement(keyPriceInputSelector)
        const currentPrice = await page.evaluate(selector => {
          return document.querySelectorAll(selector)[0].value
        }, keyPriceInputSelector)
        const newPrice = Number(
          (parseFloat(currentPrice) * 2).toFixed(2)
        ).toString()
        await expect(page).toFill(keyPriceInputSelector, newPrice)
        await expect(page).toClick(`${lockToEditSelector} button`, {
          text: 'Submit',
        })
        await expect(page).toMatch(newPrice)
      })
    })
  })
})
