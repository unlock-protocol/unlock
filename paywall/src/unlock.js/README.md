# unlock-web

## Description
`unlock-web` is a package that provides the ability to integrate Unlock on your
site or app without having to pull the script from a third-party source.

## Usage

1. Install the package (`npm install --save @unlock-protocol/unlock-web`)
2. Import and use it

``` javascript
import startup from '@unlock-protocol/unlock-web'

window.unlockProtocolConfig = { /* ... see main Unlock documentation */ }

startup()
```
