import { createGlobalStyle } from 'styled-components'

/**
 * Shared CSS accross all components. Injected wtih styled-components' createGlobalStyle
 */

export const globalStyle = `
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

    --foreground: 9001;
    --alwaysontop: 100000;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: IBM Plex Sans, Helvetica Neue, Arial, sans-serif;
    color: var(--grey);
    padding: 0px;
    margin: 0px;
  }

  h1 {
    font-size: 24px;
    font-weight: 500;
  }

  h2 {
    font-size: 15px;
    font-weight: 500;
  }

  h3 {
    font-size: 14px;
    margin-bottom: 0px;
  }


  a {
    text-decoration: none;
    color: var(--link);
  }

  a:visited {
    color: var(--link);
  }

  .responsiveWrapper{
    position: relative;
    width: 100%;
    padding-top: 60%;
    overflow: hidden;
}

.responsiveWrapper iframe{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
`

export default createGlobalStyle`
  ${globalStyle}
`
