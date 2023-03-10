import { ReactElement, ReactNode, createContext, useContext } from 'react'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'

type Link = (props: any) => ReactElement

interface Props {
  children: ReactNode
  Link: Link
}

interface UIProviderContext {
  Link?: Link
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
