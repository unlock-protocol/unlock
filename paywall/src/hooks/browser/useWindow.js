import { createContext, useContext } from 'react'

export const WindowContext = createContext()

export default function useWindow() {
  return useContext(WindowContext)
}
