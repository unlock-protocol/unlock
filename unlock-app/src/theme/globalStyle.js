import { createGlobalStyle } from 'styled-components'

/**
 * Shared CSS across all components. Injected with styled-components' createGlobalStyle
 */

const globalStyle = `
  :root {
    --brand: #ff6771;
    --white: #ffffff;
    --red: #ed663a;
    --lightred: #ffb79f;
    --offwhite: #f6f6f6;
    --lightgrey: #eeeeee;
    --grey: #a6a6a6;
    --dimgrey: #6a6a6a;
    --silver: #d8d8d8;
    --darkgrey: #4a4a4a;
    --slate: #333333;
    --link: #4d8be8;
    --green: #74ce63;
    --pink: #ed6e82;

    --foreground: 9001;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'IBM Plex Sans' ,'Helvetica Neue', Arial, sans-serif;
    color: var(--grey);
  }

  h1 {
    font-size: 24px;
    font-weight: 500;
  }

  h2 {
    font-size: 15px;
    font-weight: 500;
  }

  a {
    text-decoration: none;
    color: var(--link);
  }

  a:visited {
    color: var(--link);
  }
`

export default createGlobalStyle`
  ${globalStyle}
`
