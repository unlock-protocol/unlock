import { kebabCase } from 'lodash'
import { storage } from '~/config/storage'

/**
 * recusively creates slugs for names
 * @param name
 * @param number
 * @returns
 */
export const getSlugForName = async (
  name: string,
  number?: number
): Promise<string> => {
  const slug = kebabCase([name, number].join('-'))
  const data = (await storage.getLockSettingsBySlug(slug)).data
  if (data) {
    return getSlugForName(name, number ? number + 1 : 1)
  }
  return slug
}
