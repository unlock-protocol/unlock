import { KeyPurchase, Lock } from './datasource'

// eslint-disable-next-line import/prefer-default-export
export const resolvers = {
  Query: {
    locks: () => new Lock().getLocks(),
    keyPurchases: () => new KeyPurchase().getKeyPurchases(),
  },
}
