export const paywallConfig = {
  network: 1,
  pessimistic: true,
  locks: {
    '0xb77030a7e47a5eb942a4748000125e70be598632': {
      name: 'Unlock Community',
      network: 137,
    },
  },
  icon: 'https://raw.githubusercontent.com/unlock-protocol/unlock/master/design/brand/1808-Unlock-Identity_Unlock-WordMark.svg',
  callToAction: {
    default: `Get an Unlock membership to access our Discord, blog comments and more! No xDAI to pay for gas? Click the Claim button.`,
  },
}

export default paywallConfig
