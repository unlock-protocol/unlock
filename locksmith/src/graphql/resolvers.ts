import { KeyPurchase, Lock, Key } from './datasource'
import { generateMetadata } from './datasource/metaData'

// eslint-disable-next-line import/prefer-default-export
export const resolvers = {
  Query: {
    locks: () => new Lock().getLocks(),
    keyPurchases: () => new KeyPurchase().getKeyPurchases(),
    // eslint-disable-next-line no-unused-vars
    keys: (_root: any, args: any) => new Key().getKeys(args),
    // eslint-disable-next-line no-unused-vars
    key: async (_root: any, args: any, _context: any, _info: any) => {
      return await new Key().getKey(args.id)
    },
  },
  Key: {
    // eslint-disable-next-line no-unused-vars
    metadata: async (root: any, _args: any, _context: any, _info: any) => {
      return await generateMetadata(root.lock.address, root.keyId)
    },
  },
}
