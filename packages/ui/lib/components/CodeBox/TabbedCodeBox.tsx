import { Language, PrismTheme } from 'prism-react-renderer'
import { CodeBox } from './CodeBox'
import { Tab } from '@headlessui/react'
import { UnlockPrismTheme } from './theme'
import { twMerge } from 'tailwind-merge'

interface CodeBlock {
  code: string
  name: string
  lang: Language
}

interface Props {
  blocks: CodeBlock[]
}

export function TabbedCodeBox({ blocks }: Props) {
  return (
    <div
      style={{
        backgroundColor: UnlockPrismTheme.plain.backgroundColor,
      }}
      className="relative p-4 sm:p-8 rounded-3xl"
    >
      <Tab.Group>
        <Tab.List className="flex justify-between w-full">
          {blocks.map((item, index) => (
            <Tab
              className={({ selected }) =>
                twMerge(
                  'w-full p-2.5 border border-white text-white font-medium opacity-90 hover:opacity-100 hover:bg-white hover:text-brand-ui-primary',
                  selected && 'bg-white text-brand-ui-primary opacity-100',
                  !index && 'rounded-l-xl',
                  index === blocks.length - 1 && 'rounded-r-xl'
                )
              }
            >
              {item.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="py-4">
          {blocks.map(({ lang, name, code }) => (
            <Tab.Panel key={name}>
              <CodeBox lang={lang} code={code} />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
