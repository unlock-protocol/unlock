import { Verifier } from '../models/verifier'

/**
 * Returns true if the verifier already exists on the lock and network
 * @param lockAddress
 * @param address
 * @param network
 * @returns boolean
 */
export const isVerifierAlreadyExitsOnLock = async (
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
export const getVerifiersListForLock = async (
  lockAddress: string,
  network: number
): Promise<any[]> => {
  const response = await Verifier.findAll({
    where: {
      lockAddress,
      network,
    },
  })

  const verifiers =
    response?.map((verifier: Verifier) => ({
      ...verifier.toJSON(),
    })) || []

  return verifiers
}

/**
 * Saves a new verifier for a lock
 * @param lockAddress
 * @param address
 * @param lockManager
 * @param network
 * @returns
 */
export const createVerifierForLock = async (
  lockAddress: string,
  address: string,
  lockManager: string,
  network: number,
  name: string | null
) => {
  const newVerifier = new Verifier({
    lockAddress,
    address,
    lockManager,
    network,
    name,
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
export const deleteVerifierForLock = async (
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

export const isVerifierForLock = async (
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

export const getEventVerifiers = async (slug: string) => {
  // Get the unique verifiers for the event based on the slug
}

export const addEventVerifier = async (
  slug: string,
  address: string,
  loggedUserAddress: string,
  name: string
) => {
  // Add a verifiers
}

const VerifierOperations = {
  isVerifierAlreadyExitsOnLock,
  getVerifiersListForLock,
  createVerifierForLock,
  deleteVerifierForLock,
  isVerifierForLock,
  getEventVerifiers,
}

export default VerifierOperations
