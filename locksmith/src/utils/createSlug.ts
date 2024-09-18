import { kebabCase } from 'lodash'
import { EventCollection } from '../models/EventCollection'
import { randomBytes } from 'crypto'

/**
 * Generates a unique slug for a given title.
 * The slug is created by converting the title to kebab case.
 * If the generated slug already exists,
 * a random suffix is then appended to make sure it's unique.
 *
 * @param title - The title from which to generate the slug.
 * @returns A promise that resolves to a unique slug string.
 */
export async function createSlug(title: string): Promise<string> {
  let slug = kebabCase(title)

  while (await EventCollection.findByPk(slug)) {
    const randomSuffix = randomBytes(4).toString('hex')
    slug = `${kebabCase(title)}-${randomSuffix}`
  }

  return slug
}
