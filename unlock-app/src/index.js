import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
// import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))

/**
 * Service worker disabled for now as it changes he behavior by serving /index
 * when /unlock.js
 */
// registerServiceWorker()
