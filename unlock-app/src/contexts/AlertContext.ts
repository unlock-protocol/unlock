import { useContext, createContext } from 'react'

interface AlertContextInterface {
  openAlert: ({ title: string, body: string }) => void
}

export const AlertContext = createContext({} as AlertContextInterface)

/**
 * Hook
 * @returns
 */
export const useAlert = () => {
  const { openAlert } = useContext(AlertContext)
  return openAlert
}

export default AlertContext
