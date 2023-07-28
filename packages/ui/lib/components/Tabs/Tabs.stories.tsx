import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Tabs } from './Tabs'
import { Meta, StoryFn } from '@storybook/react'
import { Input } from '../Form'

const meta = {
  component: Tabs,
  title: 'Tabs',
} satisfies Meta<typeof Tabs>

export default meta

export const DefaultTab: StoryFn<typeof meta> = () => {
  const queryCache = new QueryCache()
  const queryClient = new QueryClient({
    queryCache,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        onTabChange={(tab) => {
          console.log(`change to new tab ${tab}`)
        }}
        tabs={[
          {
            title: 'Choose a configuration',
            description:
              'Create a new configuration or continue enhance the existing one for your checkout modal',
            children: (
              <span>
                <Input placeholder="test" />
              </span>
            ),
            onNext: () =>
              // go to next tab after promise is resolved
              new Promise((res) => setTimeout(() => res('resolve'), 2000)),
          },
          {
            title: 'Configure the basics',
            description:
              'Customize the checkout modal interaction & additional behavior',
            children: <span>step 2 content</span>,
          },
          {
            title: 'Configured locks',
            description:
              'Select the locks that you would like to featured in this configured checkout modal',
            children: <span>step 3 content</span>,
            onNext: () => void 0,
            onNextLabel: 'Save',
          },
        ]}
      />
    </QueryClientProvider>
  )
}

export const TabComponentDisabled: StoryFn<typeof meta> = () => {
  const queryCache = new QueryCache()
  const queryClient = new QueryClient({
    queryCache,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        tabs={[
          {
            title: 'Choose a configuration',
            description:
              'Create a new configuration or continue enhance the existing one for your checkout modal',
            children: <span>step 1 content</span>,
          },
          {
            title: 'Configure the basics',
            description:
              'Customize the checkout modal interaction & additional behavior',
            children: <span>step 2 content</span>,
            disabled: true,
          },
          {
            title: 'Configured locks',
            description:
              'Select the locks that you would like to featured in this configured checkout modal',
            children: <span>step 3 content</span>,
            onNext: () => void 0,
            onNextLabel: 'Save',
            disabled: true,
          },
        ]}
      />
    </QueryClientProvider>
  )
}

export const TabComponentDefaultTab: StoryFn<typeof meta> = () => {
  const queryCache = new QueryCache()
  const queryClient = new QueryClient({
    queryCache,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        defaultTab={2}
        tabs={[
          {
            title: 'Choose a configuration',
            description:
              'Create a new configuration or continue enhance the existing one for your checkout modal',
            children: <span>step 1 content</span>,
          },
          {
            title: 'Configure the basics',
            description:
              'Customize the checkout modal interaction & additional behavior',
            children: <span>step 2 content</span>,
          },
          {
            title: 'Configured locks',
            description:
              'Select the locks that you would like to featured in this configured checkout modal',
            children: <span>step 3 content</span>,
            onNext: () => void 0,
            onNextLabel: 'Save',
          },
        ]}
      />
    </QueryClientProvider>
  )
}

export const TabComponentHideButton: StoryFn<typeof meta> = () => {
  const queryCache = new QueryCache()
  const queryClient = new QueryClient({
    queryCache,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        defaultTab={2}
        tabs={[
          {
            title: 'Choose a configuration',
            description:
              'Create a new configuration or continue enhance the existing one for your checkout modal',
            children: <span>step 1 content</span>,
            showButton: false,
          },
          {
            title: 'Configure the basics',
            description:
              'Customize the checkout modal interaction & additional behavior',
            children: <span>step 2 content</span>,
            showButton: false,
          },
          {
            title: 'Configured locks',
            description:
              'Select the locks that you would like to featured in this configured checkout modal',
            children: <span>step 3 content</span>,
            onNext: () => void 0,
            onNextLabel: 'Save',
            showButton: false,
          },
        ]}
      />
    </QueryClientProvider>
  )
}

export const TabWithLoading: StoryFn<typeof meta> = () => {
  const queryCache = new QueryCache()
  const queryClient = new QueryClient({
    queryCache,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        onTabChange={(tab) => {
          console.log(`change to new tab ${tab}`)
        }}
        defaultTab={2}
        tabs={[
          {
            title: 'Choose a configuration',
            description:
              'Create a new configuration or continue enhance the existing one for your checkout modal',
            children: (
              <span>
                <Input placeholder="test" />
              </span>
            ),
            onNext: () =>
              // go to next tab after promise is resolved
              new Promise((res) => setTimeout(() => res('resolve'), 2000)),
          },
          {
            title: 'Configure the basics',
            description:
              'Customize the checkout modal interaction & additional behavior',
            children: <span>step 2 content</span>,
            loading: true,
          },
          {
            title: 'Configured locks',
            description:
              'Select the locks that you would like to featured in this configured checkout modal',
            children: <span>step 3 content</span>,
            onNext: () => void 0,
            onNextLabel: 'Save',
            loading: true,
          },
        ]}
      />
    </QueryClientProvider>
  )
}
