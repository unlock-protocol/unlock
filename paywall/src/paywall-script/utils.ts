export const dispatchEvent = (detail: any) => {
  let event: any
  try {
    event = new window.CustomEvent('unlockProtocol', { detail })
  } catch (e) {
    // older browsers do events this clunky way.
    // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
    // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/initCustomEvent#Parameters
    event = window.document.createEvent('customevent')
    event.initCustomEvent(
      'unlockProtocol',
      true /* canBubble */,
      true /* cancelable */,
      detail
    )
  }
  window.dispatchEvent(event)
}

export const setupUnlockProtocolVariable = (properties: {
  [name: string]: any
}) => {
  const unlockProtocol: Object = {}

  const immutable = {
    writable: false,
    configurable: false,
    enumerable: false,
  }

  const immutableProperties = Object.keys(properties).map(name => {
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

  const freeze: (obj: any) => void = Object.freeze || Object

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
