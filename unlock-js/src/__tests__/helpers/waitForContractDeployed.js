/**
 * Waits for address to have a non zero opcode
 * Tests which use this will timeout if the addresse never gets deployed!
 * @param {*} provider
 * @param {*} address
 */
export const waitForContractDeployed = async (provider, address) => {
  return new Promise(resolve => {
    const pollHasContractDeployed = async (address, delay, tries) => {
      let opCode = '0x'
      try {
        opCode = await provider.getCode(address)
      } catch (e) {
        // Is Ganache down?
      }

      if (opCode !== '0x') {
        return resolve()
      }
      return setTimeout(() => {
        pollHasContractDeployed(address, delay, tries + 1)
      }, delay)
    }

    pollHasContractDeployed(address, 100, 0)
  })
}
