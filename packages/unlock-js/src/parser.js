/**
 * An helper function to return possible getters
 * @param {string} signature the signature of the function
 */
export function parseGetters(abi) {
  const getters = {}
  const signatures = abi
    .map((signature) => signature.split(' '))
    .filter(
      ([type, , arg1, arg2]) =>
        type === 'function' && // get only functions
        (arg1 === 'pure' ||
          arg2 === 'pure' || // pure function
          arg1 === 'view' ||
          arg2 === 'view') // view function
    )

  signatures.forEach(([, signature]) => {
    getters[signature] = async () => await this.getUnlockContract()[signature]
  })

  return getters
}
