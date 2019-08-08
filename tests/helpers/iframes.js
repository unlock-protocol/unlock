// This file is a helper to abstract the retrieval of the iframes on the paywall,
// so that any re-ordering of frames is controlled in a single location

module.exports = {
  checkoutIframe: page =>
    page.frames().find(frame => frame.name() === 'unlock checkout'),
  accountsIframe: page =>
    page.frames().find(frame => frame.name() === 'unlock accounts'),
}
