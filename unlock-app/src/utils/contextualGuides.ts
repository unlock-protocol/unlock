export const contextualGuideCallouts = {
  membership: {
    title: 'Need help creating a membership?',
    description:
      'Use the membership guide to plan tiers, benefits, pricing, and duration before deploying your lock.',
    href: 'https://unlock-protocol.com/guides/how-to-create-a-membership-program/',
    linkLabel: 'Open membership guide',
  },
  event: {
    title: 'Need help creating an event?',
    description:
      'Use the event ticketing guide to plan ticket supply, pricing, attendee approval, distribution, and check-in.',
    href: 'https://unlock-protocol.com/guides/how-to-sell-nft-tickets-for-an-event/',
    linkLabel: 'Open event guide',
  },
  certification: {
    title: 'Need help creating a certification?',
    description:
      'Use the certification guide to plan credential details, issuing, recipient notifications, and LinkedIn sharing.',
    href: 'https://unlock-protocol.com/guides/certifications/',
    linkLabel: 'Open certification guide',
  },
} as const

export type ContextualGuideKey = keyof typeof contextualGuideCallouts

export const contextualGuideOrder: ContextualGuideKey[] = [
  'membership',
  'event',
  'certification',
]
