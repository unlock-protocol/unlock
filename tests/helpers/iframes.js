// This file is a helper to abstract the retrieval of the iframes on the paywall,
// so that any re-ordering of frames is controlled in a single location

module.exports = {
  checkoutIframe: page => page.mainFrame().childFrames()[2],
  accountsIframe: page => page.mainFrame().childFrames()[1],
}
