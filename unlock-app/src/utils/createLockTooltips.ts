export const createLockTooltips = {
  network:
    'Choose where the membership contract gets deployed. This affects gas fees, available currencies, and which wallets can use the membership.',
  name: 'This is the public name for the membership contract and the NFT members receive.',
  duration:
    'This is how long each purchased membership remains valid before it expires or needs to be renewed.',
  quantity:
    'This is the number of memberships buyers can mint from this lock. Managers can still airdrop memberships separately.',
  price:
    'Set the amount and currency buyers pay for one membership. Free memberships can still collect member details during checkout.',
} as const

export type CreateLockTooltipKey = keyof typeof createLockTooltips

export const createLockTooltipOrder: CreateLockTooltipKey[] = [
  'network',
  'name',
  'duration',
  'quantity',
  'price',
]
