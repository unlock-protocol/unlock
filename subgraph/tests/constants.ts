// lock
export const lockAddress = '0x0000000000000000000000000000000000000011'
export const lockAddressV9 = '0x0000000000000000000000000000000000000008'
export const lockOwner = '0x0000000000000000000000000000000000000001'
export const lockManagers = [
  '0x0000000000000000000000000000000000000123',
  '0x0000000000000000000000000000000000000124',
  '0x0000000000000000000000000000000000000125',
]

export const keyGranters = [
  '0x0000000000000000000000000000000000000123',
  '0x0000000000000000000000000000000000000124',
  '0x0000000000000000000000000000000000000125',
]

// protocol
export const unlockAddress = '0x0000000000000000000000000000000000000018'

// key
export const keyOwnerAddress = '0x0000000000000000000000000000000000000002'
export const tokenId = 1234
export const now = 16613300000
export const expiration = 16613302653
export const tokenURI = 'http://token-api'
export const maxNumberOfKeys = 10
export const maxKeysPerAddress = 5

// referrer
export const referrerFee = 200

// prices
export const keyPrice = 1000
export const newKeyPrice = 1001
export const duration = 60 * 60 * 24 // 24h
export const tokenAddress = '0x0000000000000000000000000000000000000007'

// metadata
export const name = 'Lock Metadata'
export const symbol = 'METAKEY'
export const baseTokenURI = 'https:/custom-lock.com/api/key/'

// default address used in newMockEvent() function
export const defaultMockAddress =
  '0xA16081F360e3847006dB660bae1c6d1b2e17eC2A'.toLowerCase()
export const nullAddress = '0x0000000000000000000000000000000000000000'

// TODO: compile from contract ABI
// WARNING : For some tokens it may be different. In that case we would move to a list!
// TODO: for easier handling on future locks: trigger an "paid" event with the amount and data needed?
export const ERC20_TRANSFER_TOPIC0 =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

export const GNP_CHANGED_TOPIC0 =
  '0x3b50eb9d9b4a8db204f2928c9e572c2865b0d02803493ccb6aa256848323ebb7'
