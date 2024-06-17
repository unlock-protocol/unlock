import { storage } from '~/config/storage'
import { UserAccountType } from './userAccountType'

export const getUserAccountType = async (
  emailAddress: string
): Promise<UserAccountType[]> => {
  try {
    const response = await storage.getUserAccountType(emailAddress)

    return response.data.userAccountType as UserAccountType[]
  } catch (error) {
    return []
  }
}
