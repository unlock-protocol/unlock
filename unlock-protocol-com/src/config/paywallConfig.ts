export const paywallConfig = {
  network: 1,
  pessimistic: true,
  locks: {
    '0xCE62D71c768aeD7EA034c72a1bc4CF58830D9894': {
      name: 'Unlock Community',
      network: 100,
    },
  },
  icon: 'https://raw.githubusercontent.com/unlock-protocol/unlock/master/design/brand/1808-Unlock-Identity_Unlock-WordMark.svg',
  callToAction: {
    default: `Get an Unlock membership to access our Discord, blog comments and more! No xDAI to pay for gas? Click the Claim button.`,
  },
}

export default paywallConfig
