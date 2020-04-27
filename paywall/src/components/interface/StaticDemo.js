import React from 'react'
import Demo from './Demo'

/**
 * This is a component that shows the demo with an injected paywall directly in its DOM, not thru
 * an iframe. It is used only in storybook
 */
export default function StaticDemo() {
  return <Demo checkout={() => {}} />
}
