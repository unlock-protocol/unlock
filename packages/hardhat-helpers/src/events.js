export const getEvent = async (tx, eventName) => {
  const { hash, logs, blockNumber } = tx
  const event = logs.find(
    ({ fragment }) => fragment && fragment.name === eventName
  )
  if (!event) return null
  const { args } = event
  return { logs, args, hash, event, blockNumber }
}

export const getEvents = async (tx, eventName) => {
  const { hash, logs, blockNumber } = tx
  const events = logs.filter(
    ({ fragment }) => fragment && fragment.name === eventName
  )
  return { hash, events, blockNumber }
}

export default {
  getEvent,
  getEvents,
}
