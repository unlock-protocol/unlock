import { KeyPurchase, Lock, Key } from './datasource'
import { generateMetadata } from './datasource/metaData'

// eslint-disable-next-line import/prefer-default-export
export const resolvers = {
  Query: {
    locks: () => new Lock().getLocks(),
    keyPurchases: () => new KeyPurchase().getKeyPurchases(),
    keys: () => new Key().getKeys(),
    // eslint-disable-next-line no-unused-vars
    key: async (_root: any, args: any, _context: any, _info: any) => {
      let baseKeyData = await new Key().getKey(args.id)
      let metadata = await generateMetadata(
        baseKeyData.lock.address,
        baseKeyData.keyId
      )

      return { ...baseKeyData, metadata }
    },
  },
}
