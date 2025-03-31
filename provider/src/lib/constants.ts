// Default cache TTL in seconds (1 week)
export const DEFAULT_CACHE_TTL = 60 * 60 * 24 * 7 // 1 week

// Cache API TTL in seconds (1 day)
export const CACHE_API_TTL = 86400

// contract type prefix for KV namespace
export const KV_CONTRACT_TYPE_PREFIX = 'contract_type_'

// ENS caching prefix for KV namespace to avoid collisions
export const KV_ENS_CACHE_PREFIX = 'ens_cache_'

/**
 * ENS/Basename contract addresses by network
 */
export const NAME_RESOLVER_CONTRACTS: Record<string, string[]> = {
  // Ethereum mainnet ENS contracts
  '1': [
    '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', // ENS Registry
    '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41', // Public Resolver
    '0x231b0Ee14048e9dccD1d247744d114a4eb5E8E63', // Reverse Registrar
    '0xa2C122BE93b0074270EBee7f6B7292C7dEB45047', // New Public Resolver
  ].map((addr) => addr.toLowerCase()),

  // Basenames contracts
  '8453': [
    '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD',
    '0x4aE7413182849D062B72518928A4B2DE87f0E411',
    '0xd4416b13d2B3a9aBae7AcD5D6C2BbDBE25686401',
  ].map((addr) => addr.toLowerCase()),
}

/**
 * Method signatures for ENS/Basename functions
 */
export const NAME_RESOLVER_METHOD_SIGNATURES = [
  '0x0178b8bf', // resolver(bytes32)
  '0x3b3b57de', // addr(bytes32)
  '0x691f3431', // name(bytes32) - reverse resolution
  '0x59d1d43c', // getText(bytes32,string)
  '0x10f13a8c', // setText(bytes32,string,string)
  '0x01ffc9a7', // supportsInterface(bytes4)
]
