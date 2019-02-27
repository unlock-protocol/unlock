import { useEffect } from 'react'

export default function useUnlockFlagCss(window, locked) {
  useEffect(
    () => {
      if (locked) return
      const height = '160px'
      const body = window.document.body
      body.style.margin = '0'
      body.style.height = height
      body.style.display = 'flex'
      body.style.flexDirection = 'column'
      body.style.justifyContent = 'center'
      body.style.overflow = 'hidden'
    },
    [locked]
  )
}
