import { RadioGroup } from '@headlessui/react'
import { classed } from '@tw-classed/react'
import { ReactNode, useRef, useState } from 'react'
import { Button } from '../Button/Button'
import { QueryClientProvider, useMutation } from '@tanstack/react-query'
import { DEFAULT_QUERY_CLIENT_OPTIONS } from '../constants'

interface TabProps {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  disabled?: boolean
  onNext?: () => Promise<any> | void
  onNextLabel?: string
  showButton?: boolean
}

interface TabsProps {
  defaultTab?: number // the position of the tab
  tabs?: TabProps[]
}

type TabHeaderProps = Pick<TabProps, 'title' | 'description'> & {
  open: boolean
  tabNumber: number
  scrollIntoView: () => void
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
}: TabHeaderProps) => {
  return (
    <TabContainer className="cursor-pointer" onClick={scrollIntoView}>
      <TabNumber active={open}>{tabNumber}</TabNumber>
      <div className="flex flex-col gap-2 text-left">
        <TabTitle>{title}</TabTitle>
        {description && <TabDescription>{description}</TabDescription>}
      </div>
    </TabContainer>
  )
}

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
}: TabProps & {
  tabIndex: number
  isLast: boolean
  setTab?: any
}) => {
  const tabNumber = tabIndex + 1 // incrementing number of the tab
  const tabRef = useRef<HTMLElement | null>(null)

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
      setTab(tabNumber + 1)
    }

    scrollIntoView()
  }

  const handleNextMutation = useMutation(handleNext)

  return (
    <RadioGroup.Option
      className={`${disabled ? 'opacity-50' : ''}`}
      disabled={disabled}
      value={tabNumber}
      data-tab-index={tabNumber}
      ref={tabRef}
    >
      {({ checked }) => (
        <>
          <TabHeader
            tabNumber={tabNumber}
            title={title}
            description={description}
            open={checked}
            scrollIntoView={scrollIntoView}
          />
          {checked && (
            <div className="grid grid-cols-[48px_1fr] gap-4">
              <div className="relative flex justify-center w-12 h-full">
                <div className="w-[2px] bg-gray-300 h-full"></div>
              </div>
              <div className="flex flex-col w-full gap-10 mt-10">
                {children}
                {showButton && (
                  <Button
                    loading={handleNextMutation.isLoading}
                    className="w-full"
                    onClick={() => {
                      handleNextMutation.mutateAsync()
                    }}
                  >
                    {onNextLabel}
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </RadioGroup.Option>
  )
}

export function Tabs({ defaultTab = 1, tabs }: TabsProps) {
  const [tab, setTab] = useState(defaultTab)

  return (
    <QueryClientProvider client={DEFAULT_QUERY_CLIENT_OPTIONS}>
      <RadioGroup onChange={setTab} value={tab} className="grid gap-8">
        {tabs?.map((tab, tabIndex) => {
          const isLast = tabIndex + 1 === tabs?.length

          return (
            <Tab
              key={tabIndex}
              tabIndex={tabIndex}
              isLast={isLast}
              setTab={setTab}
              {...tab}
            />
          )
        })}
      </RadioGroup>
    </QueryClientProvider>
  )
}
