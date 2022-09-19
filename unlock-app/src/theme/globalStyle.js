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
    --sharpred: #f24c15;
    --offwhite: #f6f6f6;
    --lightgrey: #eeeeee;
    --grey: #a6a6a6;
    --dimgrey: #6a6a6a;
    --silver: #d8d8d8;
    --darkgrey: #4a4a4a;
    --slate: #333333;
    --link: #4d8be8;
    --blue: #4d8be8;
    --green: #74ce63;
    --darkgreen: #368043;
    --activegreen: #59c245;
    --pink: #ed6e82;
    --yellow: #f6c61b;
    --labelgrey: #7d7d7d;

    --foreground: 9001;
    --alwaysontop: 100000;
  }
`

export default createGlobalStyle`
  ${globalStyle}
`
