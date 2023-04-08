import { ReactNode, createContext, useContext } from 'react'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'

// TODO: add better type for Link
export type Link = any

export interface Props {
  children: ReactNode
  Link?: Link | null
}

export interface UIProviderContext {
  Link?: Link | null
}

export const UnlockUIContext = createContext<UIProviderContext>({
  Link: undefined,
})

export function UnlockUIProvider({ children, Link }: Props) {
  return (
    <UnlockUIContext.Provider
      value={{
        Link,
      }}
    >
      <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
    </UnlockUIContext.Provider>
  )
}

export const useUnlockUI = () => {
  return useContext(UnlockUIContext)
}
