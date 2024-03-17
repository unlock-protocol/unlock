import i18n from 'i18next'
import { TxKeyPath } from './i18n'

/**
 * Translates text.
 *
 * @param key The i18n key.
 * @param options The i18n options.
 * @returns The translated text.
 *
 */
export function translate(key: TxKeyPath) {
  return i18n.t(key)
}
