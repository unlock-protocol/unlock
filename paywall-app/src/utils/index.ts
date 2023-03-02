export const setupUnlockProtocolVariable = (properties: {
  [name: string]: any
}) => {
  const unlockProtocol: any = {}

  const immutable = {
    writable: false,
    configurable: false,
    enumerable: false,
  }

  const immutableProperties = Object.keys(properties).map((name) => {
    return {
      [name]: {
        value: properties[name],
        ...immutable,
      },
    }
  })

  Object.defineProperties(
    unlockProtocol,
    Object.assign({}, ...immutableProperties)
  )

  const freeze: (_obj: any) => void = Object.freeze || Object

  // if freeze is available, prevents adding or
  // removing the object prototype properties
  // (value, get, set, enumerable, writable, configurable)
  // TODO: consider whether this is actually necessary
  freeze(unlockProtocol)

  try {
    Object.defineProperties(window, {
      unlockProtocol: {
        value: unlockProtocol,
        ...immutable,
      },
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('WARNING: unlockProtocol already defined, cannot re-define it')
  }
}
