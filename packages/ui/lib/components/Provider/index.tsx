import { ReactNode, createContext, useContext } from 'react'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'

// TODO: add better type for Link
type Link = any

interface Props {
  children: ReactNode
  Link?: Link | null
}

interface UIProviderContext {
  Link?: Link | null
}

export const UnlocUIContext = createContext<UIProviderContext>({
  Link: undefined,
})

export const UnlockUIProvider = ({ children, Link }: Props) => {
  return (
    <UnlocUIContext.Provider
      value={{
        Link,
      }}
    >
      <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
    </UnlocUIContext.Provider>
  )
}

export const useUnlockUI = () => {
  return useContext(UnlocUIContext)
}
