import { KeyPurchase, Key, LocksByOwner, Keys } from './datasource'
import { generateMetadata } from './datasource/metaData'
import { KeyHolder } from './datasource/keyHolder'
import { KeyHoldersByLock } from './datasource/keyholdersByLock'

export const resolvers = {
  Query: {
    locks: (_root: any, args: any, network: number) => {
      if (args.where.owner) {
        return new LocksByOwner().get(args.where.owner, network)
      }
      return new KeyHoldersByLock().getKeyHolders(
        args.where.address_in,
        args.where.page,
        network
      )
    },
    keyPurchases: (network: number) =>
      new KeyPurchase().getKeyPurchases(network),
    // eslint-disable-next-line no-unused-vars
    keys: (_root: any, args: any, network: number) =>
      new Key(network).getKeys(args),
    // eslint-disable-next-line no-unused-vars
    key: async (_root: any, args: any, network: number, _info: any) =>
      new Key(network).getKey(args.id),
    keyHolders: async (_root: any, args: any, network: number) =>
      new KeyHolder().get(args.where.address, network),
    members: async (args: any, network: number) => new Keys(network).get(args),
  },
  Key: {
    // eslint-disable-next-line no-unused-vars
    metadata: async (root: any, _args: any, _context: any, _info: any) =>
      generateMetadata(root.lock.address, root.keyId, 1 /** TODO: FIX ME? */),
  },
}
