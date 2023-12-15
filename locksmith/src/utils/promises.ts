export const waitOrTimeout = async (
  promise: Promise<any>,
  delay: number,
  responseIfTimeout: () => any
) => {
  let timeout
  const result = await Promise.race([
    new Promise(
      (resolve) =>
        (timeout = setTimeout(() => {
          resolve(responseIfTimeout())
        }, delay))
    ),
    promise,
  ])
  clearTimeout(timeout)
  return result
}
