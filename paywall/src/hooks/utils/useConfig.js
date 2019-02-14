import { createContext, useContext } from 'react'

import configure from '../../config'

export const ConfigContext = createContext(configure())

export default function useConfig() {
  return useContext(ConfigContext)
}
