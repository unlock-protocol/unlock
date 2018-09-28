import { injectGlobal } from 'styled-components'

/**
 * Shared CSS accross all components. Injected wtih styled-components' injectGlobal
 */

injectGlobal`
  @import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400,500,600,700');
  @import url('https://fonts.googleapis.com/css?family=IBM+Plex+Mono:200i,200,500');
  @import url('https://fonts.googleapis.com/css?family=IBM+Plex+Serif:300,400');

  :root {
    --white: #ffffff;
    --red: #ed663a;
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
