import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Button } from './..'
import '../dist/style.css'

function App() {
  return (
    <div>
      <Button> Unlock Button </Button>
    </div>
  )
}

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
)
