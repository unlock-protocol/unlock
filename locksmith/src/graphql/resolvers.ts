import { KeyPurchase, Key, LocksByOwner } from './datasource'
import { generateMetadata } from './datasource/metaData'
import { KeyHolder } from './datasource/keyHolder'
import { KeyHoldersByLock } from './datasource/keyholdersByLock'

export const resolvers = {
  Query: {
    locks: (_root: any, args: any) => {
      if (args.where.owner) {
        return new LocksByOwner().get(args.where.owner)
      }
      return new KeyHoldersByLock().getKeyHolders(
        args.where.address_in,
        args.where.page
      )
    },
    keyPurchases: () => new KeyPurchase().getKeyPurchases(),
    // eslint-disable-next-line no-unused-vars
    keys: (_root: any, args: any) => new Key().getKeys(args),
    // eslint-disable-next-line no-unused-vars
    key: async (_root: any, args: any, _context: any, _info: any) =>
      new Key().getKey(args.id),
    keyHolders: async (_root: any, args: any) =>
      new KeyHolder().get(args.where.address),
  },
  Key: {
    // eslint-disable-next-line no-unused-vars
    metadata: async (root: any, _args: any, _context: any, _info: any) =>
      generateMetadata(root.lock.address, root.keyId, 1 /** TODO: FIX ME? */),
  },
}
