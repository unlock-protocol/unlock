### Wordpress + UI components

## Usage example

In order to use this example we need first to follow the steps included in this document [WordPress + UI components](https://www.notion.so/unlockprotocol/Wordpress-UI-components-abdd616f489945bba288a4458d2ef7fc)

```html
<!-- 1) custom element for header -->
<div id="header" style="min-height: 96px"></div>

<!-- 2) custom code to use react components -->
<script type="module">
  import React from 'react'
  import ReactDOM from 'react-dom'
  import { ShowcaseHeader } from '@unlock-packages/ui' // import components we need to use

  const header = document.getElementById('header')

  const headerElement = React.createElement(ShowcaseHeader)
  ReactDOM.createRoot(header).render(headerElement)
</script>
```
