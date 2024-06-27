import logger from '../../../logger'
import { googleAuthClient } from './googleAuthClient'

/**
 * Creates a new Google Wallet pass class.
 *
 * @param classId - The class ID to be created.
 * @returns The response from the class creation request.
 * @throws An error if the creation fails.
 */
export async function createClass(classID: string) {
  try {
    const walletPassClass = {
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
    const response = await googleAuthClient.request({
      url: 'https://walletobjects.googleapis.com/walletobjects/v1/genericClass',
      method: 'POST',
      data: walletPassClass,
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
 * @returns The existing or newly created class object.
 * @throws An error if there is a problem checking the class existence or creating the class.
 */
export async function getOrCreateWalletClass(classID: string) {
  try {
    // Check if the class already exists
    const response = await googleAuthClient.request({
      url: `https://walletobjects.googleapis.com/walletobjects/v1/genericClass/${classID}`,
      method: 'GET',
    })
    logger.info('Class already exists')
    return response.data.id
  } catch (error) {
    // If the class does not exist, create a new one
    if (error.response && error.response.status === 404) {
      logger.info('Class does not exist, creating a new one...')
      const newClass = await createClass(classID)
      return newClass
    } else {
      // Handle other errors
      logger.error('Error checking class existence:', error)
      throw new Error('Error checking class existence')
    }
  }
}
