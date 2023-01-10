import React from 'react'
import ReactDOMServer from 'react-dom/server'
import * as rtl from '@testing-library/react'
import BrowserOnly from '../../../components/helpers/BrowserOnly'

describe('BrowserOnly', () => {
  const tester = (
    <BrowserOnly>
      <div>first</div>
      <div>second</div>
    </BrowserOnly>
  )

  it('renders children in the browser', () => {
    expect.assertions(2)
    const element = rtl.render(tester)
    expect(element.queryByText('first')).not.toBeNull()
    expect(element.queryByText('second')).not.toBeNull()
  })

  it('does not render children on the server', () => {
    expect.assertions(1)
    const output = ReactDOMServer.renderToStaticMarkup(tester)
    expect(output).toBe('')
  })
})
