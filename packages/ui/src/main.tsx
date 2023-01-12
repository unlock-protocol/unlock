import React from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from './..'
import '../dist/style.css'

function App() {
  return (
    <div>
      <Button> Unlock Button </Button>
    </div>
  )
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)
