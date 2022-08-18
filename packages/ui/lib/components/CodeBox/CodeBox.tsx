import Highlight, { defaultProps, Language } from 'prism-react-renderer'
import { twMerge } from 'tailwind-merge'
import { UnlockPrismTheme } from './theme'

interface Props {
  lang: Language
  code: string
}

export function CodeBox({ lang, code }: Props) {
  return (
    <Highlight
      {...defaultProps}
      theme={UnlockPrismTheme}
      code={code}
      language={lang}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          style={style}
          className={twMerge(
            className,
            'rounded-xl font-mono p-2 overflow-auto text-sm'
          )}
        >
          {tokens.map((line, index) => (
            <div
              {...getLineProps({ line, key: index, className: 'table-row' })}
            >
              <span className="table-cell pr-2 opacity-50"> {index + 1} </span>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}
