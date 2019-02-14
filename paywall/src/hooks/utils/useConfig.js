import { createContext, useContext } from 'react'

export const ConfigContext = createContext(3)

export default function useConfig() {
  return useContext(ConfigContext)
}
