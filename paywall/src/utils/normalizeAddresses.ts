/**
 * convert lock addresses to a normal form.
 */
export function normalizeLockAddress(address: string) {
  // TODO: export checksum lock function from web3Service and use that instead
  return address.toLowerCase()
}

type KeyedObject = { [key: string]: any }
type SpecificObject<T> = { [key: string]: T }
type InternalType<T> = T extends { [key: string]: infer U } ? U : never
/**
 * convert the key indices of an object to normalized form
 *
 * Used for normalizing key and lock indices
 */
export function normalizeAddressKeys<
  T extends KeyedObject,
  U extends InternalType<T> = InternalType<T>
>(object: SpecificObject<U>): SpecificObject<U> {
  return Object.keys(object).reduce(
    (newObject: { [key: string]: any }, key) => {
      const value = object[key]
      newObject[normalizeLockAddress(key)] = value
      return newObject
    },
    {}
  )
}
