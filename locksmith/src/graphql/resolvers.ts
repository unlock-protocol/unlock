import { KeyPurchase, Lock } from './datasource'

export const resolvers = {
  Query: {
    locks: () => new Lock().getLocks(),
    keyPurchases: () => new KeyPurchase().getKeyPurchases(),
  },
}
