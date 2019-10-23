import React from 'react'
import * as rtl from 'react-testing-library'
import InlineModal from '../../../components/interface/InlineModal'

describe('InlineModal', () => {
  it('should not render anything when inactive', () => {
    expect.assertions(1)
    const dismiss = jest.fn()

    const { container } = rtl.render(
      <InlineModal active={false} dismiss={dismiss}>
        <p>Just some text</p>
      </InlineModal>
    )

    expect(container.innerHTML).toHaveLength(0)
  })

  it('should call the dismiss function when the quit button is clicked', () => {
    expect.assertions(2)
    const dismiss = jest.fn()

    const { container } = rtl.render(
      <InlineModal active dismiss={dismiss}>
        <p>Just some text</p>
      </InlineModal>
    )

    expect(dismiss).not.toHaveBeenCalled()

    const quit = container.querySelector('a')

    if (quit) {
      rtl.fireEvent.click(quit)
      expect(dismiss).toHaveBeenCalled()
    }
  })
})
