const url = require('./url')
const wait = require('./wait')

/**
 * Helper function to list locks on the dashboard
 */
const listLocks = async () =>
  page.evaluate(() => {
    const lockElements = document.getElementsByClassName('lock')
    return Array.from(lockElements).map(el => el.getAttribute('data-address'))
  })

/**
 * Helper function to deploy a lock
 */
const deployLock = async (
  name,
  expirationDuration,
  maxNumberOfKeys,
  keyPrice,
  useERC20 = false
) => {
  await page.goto(url.main('/dashboard'), { waitUntil: 'networkidle2' })

  // List all locks (there should be a new one)
  const existingLocks = await listLocks()

  await page.waitFor('#CreateLockButton')
  await expect(page).toClick('button', { text: 'Create Lock' })

  await expect(page).toFill('input[name="name"]', name)
  await expect(page).toFill(
    'input[name="expirationDuration"]',
    expirationDuration
  )
  await expect(page).toFill('input[name="maxNumberOfKeys"]', maxNumberOfKeys)
  await expect(page).toFill('input[name="keyPrice"]', keyPrice)
  if (useERC20) {
    // TODO - we should NOT be using div for clickable elements
    await expect(page).toClick('div.currency')
    // it takes a split second for the javascript to run,
    // this ensures we have changed the currency before we create the lock
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  await expect(page).toClick('button', { text: 'Submit' })
  await wait.untilIsGone('.lockForm')

  // List all locks (there should be a new one)
  const locks = await listLocks()

  // This is the new lock
  const newLock = locks.find(lock => {
    return !existingLocks.includes(lock)
  })

  // Wait for the lock to start confirming
  await wait.untilIsFalse(address => {
    return document
      .querySelector(`[data-address="${address}"]`)
      .innerText.includes('Submitted')
  }, newLock)

  // Wait fot the lock to be confirmed
  await wait.untilIsFalse(address => {
    return document
      .querySelector(`[data-address="${address}"]`)
      .innerText.includes('Confirming')
  }, newLock)

  // Ready!
  return newLock
}

module.exports = {
  listLocks,
  deployLock,
}
