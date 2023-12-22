export const getEvent = async (tx, eventName) => {
  const { hash, logs } = tx
  const event = logs.find(
    ({ fragment }) => fragment && fragment.name === eventName
  )
  const { args } = event
  return { logs, args, hash, event }
}

export default {
  getEvent,
}
