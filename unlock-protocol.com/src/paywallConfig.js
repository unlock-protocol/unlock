const paywallConfig = {
  network: 1,
  locks: {
    '0xB0114bbDCe17e0AF91b2Be32916a1e236cf6034F': {
      name: 'Unlock Community',
      network: 1,
    },
    '0xac1fceC2e4064CCd83ac8C9B0c9B8d944AB0D246': {
      name: 'Unlock Community',
      network: 100,
    },
  },
  icon: 'https://unlock-protocol.com/static/images/svg/unlock-word-mark.svg',
  callToAction: {
    default:
      'Unlock lets you easily offer paid memberships to your website or application. On this website, members can leave comments and participate in discussion. It is free to try! Just click "purchase" below.',
  },
}

module.exports = paywallConfig
