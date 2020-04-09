// This file is a helper to abstract the retrieval of the iframes on the paywall,
// so that any re-ordering of frames is controlled in a single location

/**
 * Waits for an iframe to exist
 */
const waitFor = (page, urlMatch) => {
  const checkIfIframeExists = resolve => {
    const iframe = page.frames().find(frame => frame.url().match(urlMatch))
    if (iframe) {
      return resolve(iframe)
    }
    return setTimeout(() => {
      checkIfIframeExists(resolve)
    }, 100)
  }

  return new Promise(resolve => {
    return checkIfIframeExists(resolve)
  })
}

module.exports = {
  waitFor,
  checkoutIframe: page =>
    page.frames().find(frame => frame.url().match(/\/checkout/)),
  accountsIframe: page =>
    page.frames().find(frame => frame.name() === 'unlock accounts'),
}
