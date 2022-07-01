import { Verifier } from '../models/verifier'

namespace VerifierOperations {
  /**
   * Returns true if the verifier already exists on the lock and network
   * @param lockAddress
   * @param address
   * @param network
   * @returns boolean
   */
  export const isVerifierAlreadyExits = async (
    lockAddress: string,
    address: string,
    network: number
  ): Promise<boolean> => {
    return !!(await Verifier.findOne({
      where: {
        address,
        lockAddress,
        network,
      },
    }))
  }

  /**
   * Yields a list of verifiers for a lock
   * @param lockAddress
   * @param network
   * @returns
   */
  export const getVerifiersList = async (
    lockAddress: string,
    network: number
  ): Promise<Verifier[] | null> => {
    return Verifier.findAll({
      where: {
        lockAddress,
        network,
      },
    })
  }

  /**
   * Saves a new verifier for a lock
   * @param lockAddress
   * @param address
   * @param lockManager
   * @param network
   * @returns
   */
  export const createVerifier = async (
    lockAddress: string,
    address: string,
    lockManager: string,
    network: number
  ) => {
    const newVerifier = new Verifier({
      lockAddress,
      address,
      lockManager,
      network,
    })
    return newVerifier.save()
  }

  /**
   * Deletes a verifier for a lock
   * @param lockAddress
   * @param address
   * @param network
   * @returns
   */
  export const deleteVerifier = async (
    lockAddress: string,
    address: string,
    network: number
  ) => {
    return Verifier.destroy({
      where: {
        lockAddress,
        address,
        network,
      },
    })
  }

  export const isVerifier = async (
    lockAddress: string,
    address: string,
    network: number
  ) => {
    return await Verifier.findOne({
      where: {
        lockAddress,
        address,
        network,
      },
    })
  }
}

export default VerifierOperations
