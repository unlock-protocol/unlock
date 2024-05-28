import config from '../../../config/config'
import logger from '../../../logger'
import { googleAuthClient } from './googleAuthClient'

// Retrieve Google wallet issuer ID and class ID from the configuration
const { googleWalletIssuerID, googleWalletClass } = config

// Set the Google wallet class ID for the given issuer ID
const classID = `${googleWalletIssuerID!}.${googleWalletClass}`

/**
 * Wallet pass class template configuration.
 * This defines the structure and fields of the pass class.
 */
export const walletPassClass = {
  id: classID,
  classTemplateInfo: {
    cardTemplateOverride: {
      cardRowTemplateInfos: [
        {
          twoItems: {
            startItem: {
              firstValue: {
                fields: [
                  {
                    fieldPath: "object.textModulesData['id']",
                  },
                ],
              },
            },
            endItem: {
              firstValue: {
                fields: [
                  {
                    fieldPath: "object.textModulesData['network']",
                  },
                ],
              },
            },
          },
        },
        {
          oneItem: {
            item: {
              firstValue: {
                fields: [
                  {
                    fieldPath: "object.textModulesData['lock_address']",
                  },
                ],
              },
            },
          },
        },
      ],
    },
  },
}

/**
 * Creates a new Google Wallet pass class.
 *
 * @param classData - The data for the class to be created.
 * @returns The response from the class creation request.
 * @throws An error if the creation fails.
 */
export async function createClass(classData: object) {
  try {
    const response = await googleAuthClient.request({
      url: 'https://walletobjects.googleapis.com/walletobjects/v1/genericClass',
      method: 'POST',
      data: classData,
    })
    logger.info('Class created')
    return response.data
  } catch (error) {
    logger.error('Error creating class:', error)
    throw new Error('Error creating class')
  }
}

/**
 * Retrieves an existing Google Wallet pass class by its ID, or creates a new one if it doesn't exist.
 *
 * This function checks whether a Google Wallet pass class specified by the given class ID exists.
 * If the class does not exist, it creates a new class using the provided class data.
 *
 * @param classId - The unique identifier of the class to check for existence.
 * @param classData - The data to use for creating the class if it does not exist.
 * @returns The existing or newly created class object.
 * @throws An error if there is a problem checking the class existence or creating the class.
 */
export async function getOrCreateWalletClass(
  classId: string,
  classData: object
) {
  try {
    // Check if the class already exists
    const response = await googleAuthClient.request({
      url: `https://walletobjects.googleapis.com/walletobjects/v1/genericClass/${classId}`,
      method: 'GET',
    })
    console.log(response.data)
    logger.info('Class already exists')
    return response.data
  } catch (error) {
    // If the class does not exist, create a new one
    if (error.response && error.response.status === 404) {
      logger.info('Class does not exist, creating a new one...')
      const newClass = await createClass(classData)
      return newClass
    } else {
      // Handle other errors
      logger.error('Error checking class existence:', error)
      throw new Error('Error checking class existence')
    }
  }
}
