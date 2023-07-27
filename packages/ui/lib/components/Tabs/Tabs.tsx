import { classed } from '@tw-classed/react'
import { InputHTMLAttributes, ReactNode, useRef, useState } from 'react'
import { Button, Props as ButtonProps } from '../Button/Button'
import { QueryClientProvider, useMutation } from '@tanstack/react-query'
import { DEFAULT_QUERY_CLIENT_OPTIONS } from '../constants'
import { Placeholder } from '../Placeholder'

interface TabProps {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  disabled?: boolean
  onNext?: () => Promise<any> | void
  onNextLabel?: string
  showButton?: boolean
  button?: ButtonProps
  loading?: boolean
}

interface TabsProps {
  defaultTab?: number // the position of the tab
  tabs?: TabProps[]
  onTabChange?: (tab: number) => void
}

type TabHeaderProps = Pick<TabProps, 'title' | 'description'> & {
  open: boolean
  tabNumber: number
  scrollIntoView: () => void
  disabled?: boolean
}
const TabContainer = classed.div(
  'grid grid-cols-[48px_1fr] items-start gap-4 w-full'
)
const TabTitle = classed.span('text-xl font-bold')
const TabDescription = classed.span('text-base font-normal text-gray-700')
const TabNumber = classed.div(
  'w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition duration-100 ease-out',
  {
    variants: {
      active: {
        false: 'bg-transparent border border-gray-700 text-gray-700',
        true: 'bg-brand-ui-primary border border-brand-ui-primary text-white',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

const TabHeader = ({
  title,
  description,
  open,
  tabNumber,
  scrollIntoView,
  disabled = false,
  ...props
}: TabHeaderProps &
  Omit<
    InputHTMLAttributes<HTMLDivElement>,
    'size' | 'id' | 'children' | 'title'
  >) => {
  return (
    <TabContainer
      className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={scrollIntoView}
      {...props}
    >
      <TabNumber active={open}>{tabNumber}</TabNumber>
      <div className="flex flex-col gap-2 text-left">
        <TabTitle>{title}</TabTitle>
        {description && <TabDescription>{description}</TabDescription>}
      </div>
    </TabContainer>
  )
}

const TabContent = classed.div('grid grid-cols-[48px_1fr] gap-4', {
  variants: {
    open: {
      false: 'hidden',
      true: 'visible',
    },
  },
})

const Tab = ({
  title,
  description,
  disabled,
  tabIndex,
  children,
  onNext,
  onNextLabel = 'Next',
  showButton = true,
  isLast = false,
  setTab,
  isOpen,
  onChange, // handle on change
  button,
  loading = false,
}: TabProps & {
  tabIndex: number
  isLast: boolean
  setTab?: any
  isOpen: boolean
  onChange?: (tab: number) => void
}) => {
  const tabNumber = tabIndex + 1 // incrementing number of the tab
  const tabRef = useRef<HTMLDivElement | null>(null)

  const scrollIntoView = () => {
    // force scroll start of tab
    setTimeout(() => {
      tabRef?.current?.scrollIntoView({
        inline: 'start',
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)
  }

  const handleNext = async () => {
    if (typeof onNext === 'function') {
      await onNext() // run promise
    }

    // go to next tab if is not the last one
    if (!isLast) {
      const tab = tabNumber + 1
      handleChange(tab)
      scrollIntoView() // scroll into view only when tab is changed
    }
  }

  const handleChange = (tab: number) => {
    if (disabled) return // handle disabled
    setTab(tab)
    onChange?.(tab)
  }

  const handleNextMutation = useMutation(handleNext)

  return (
    <div
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      data-tab-index={tabNumber}
      ref={tabRef}
    >
      <>
        <TabHeader
          disabled={disabled}
          tabNumber={tabNumber}
          title={title}
          description={description}
          open={isOpen}
          scrollIntoView={scrollIntoView}
          onClick={() => {
            handleChange(tabNumber)
          }}
        />
        <TabContent open={isOpen}>
          <div className="relative flex justify-center w-12 h-full">
            <div className="w-[2px] bg-gray-300 h-full"></div>
          </div>
          <div className="flex flex-col w-full gap-10 mt-10">
            {loading ? <Placeholder.Card /> : children}
            {showButton && (
              <Button
                loading={handleNextMutation.isLoading}
                className="w-full"
                onClick={() => {
                  handleNextMutation.mutateAsync()
                }}
                disabled={disabled || button?.disabled || loading}
                {...button}
              >
                {onNextLabel}
              </Button>
            )}
          </div>
        </TabContent>
      </>
    </div>
  )
}

export function Tabs({ defaultTab = 1, onTabChange, tabs }: TabsProps) {
  const [tab, setTab] = useState<number>(defaultTab)

  return (
    <QueryClientProvider client={DEFAULT_QUERY_CLIENT_OPTIONS}>
      <div className="grid gap-8">
        {tabs?.map((tabItem, tabIndex) => {
          const isLast = tabIndex + 1 === tabs?.length
          const isOpen = tab === tabIndex + 1

          return (
            <Tab
              key={tabIndex}
              tabIndex={tabIndex}
              isLast={isLast}
              setTab={setTab}
              isOpen={isOpen}
              onChange={(tab: number) => {
                onTabChange?.(tab) // pass current tab index
                setTab(tab)
              }}
              {...tabItem}
            />
          )
        })}
      </div>
    </QueryClientProvider>
  )
}
