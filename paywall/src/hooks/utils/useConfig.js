import { createContext, useContext } from 'react'

export const ConfigContext = createContext()

export default function useConfig() {
  return useContext(ConfigContext)
}
