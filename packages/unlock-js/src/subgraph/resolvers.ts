import { Resolvers, MeshContext } from '../@generated/subgraph'

export const resolvers: Resolvers = {
  Lock: {
    network: (root, args, context, info) =>
      root.network || context.network || 'goerli-v2', // The value we provide in the config
  },
  Query: {
    allLocks: async (root, args, context, info) =>
      Promise.all(
        args.networks.map((network) =>
          context.unlockv2.Query.locks({
            root,
            args,
            context: {
              ...context,
              network,
            } as MeshContext,
            info,
          }).then((locks) =>
            locks.map(
              (lock) =>
                ({
                  ...lock,
                  network,
                } as const)
            )
          )
        )
      ).then((locks) => locks.flat()),
  },
}
