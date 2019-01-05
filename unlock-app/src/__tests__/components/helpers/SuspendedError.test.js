import React from 'react'
import * as rtl from 'react-testing-library'

import SuspendedRender from '../../../components/helpers/SuspendedRender'

jest.useFakeTimers()

describe('SuspendedRender', () => {
  const Fallback = () => <div>hi</div>
  it('should not display anything during timeout', () => {
    const rendered = rtl.render(
      <SuspendedRender>
        <Fallback />
      </SuspendedRender>
    )
    expect(rendered.queryByText('hi')).toBeNull()
  })
  it('should display fallback after timeout', () => {
    const rendered = rtl.render(
      <SuspendedRender>
        <Fallback />
      </SuspendedRender>
    )
    expect(rendered.queryByText('hi')).toBeNull()
    jest.advanceTimersByTime(201)
    expect(rendered.queryByText('hi')).toHaveTextContent('hi')
  })
})
