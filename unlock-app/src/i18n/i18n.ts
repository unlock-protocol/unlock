import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
// if English isn't your default language, move Translations to the appropriate language file.
import en, { Translations } from './en'

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  resources: {
    /**
     * we need always include "*-US" for some valid language codes because when you change the system language,
     * the language code is the suffixed with "-US". i.e. if a device is set to English ("en"),
     * if you change to another language and then return to English language code is now "en-US".
     */
    en: { translation: en, 'en-US': en },
  },
})

export type TxKeyPath = RecursiveKeyOf<Translations>

type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`
  >
}[keyof TObj & (string | number)]

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `['${TKey}']` | `.${TKey}`
  >
}[keyof TObj & (string | number)]

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
> = TValue extends unknown[]
  ? Text
  : TValue extends object
  ? Text | `${Text}${RecursiveKeyOfInner<TValue>}`
  : Text
