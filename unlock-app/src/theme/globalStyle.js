import { createGlobalStyle } from 'styled-components'

/**
 * Shared CSS accross all components. Injected wtih styled-components' createGlobalStyle
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
    --darkgreen: #368043;
    --activegreen: #59c245;
    --pink: #ed6e82;
    --yellow: #f6c61b;
    --labelgrey: #7d7d7d;

    --foreground: 9001;
    --alwaysontop: 100000;
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

  .StripeElement {
    background-color: var(--lightgrey);
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 2rem;
    height: 60px;
    font-size: 16px;
  }
`

export default createGlobalStyle`
  ${globalStyle}
`
