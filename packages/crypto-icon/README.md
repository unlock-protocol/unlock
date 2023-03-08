# Crypto Icons Component

A component to display over hundreds of crypto icons using their symbol.

## Installation

```bash
npm install @unlock-protocol/crypto-icons
```

## Usage

```jsx
import CryptoIcon from '@unlock-protocol/crypto-icons'

const Display = () => {
  return <CryptoIcon symbol="ETH" />
}
```

It will automatically use the correct icon for the symbol and fallback to a generic icon if the symbol is not recognized.

## License

This project uses [cryptocurrency icons](https://github.com/spothq/cryptocurrency-icons) which are licensed under the Creative Commons Zero v1.0 Universal (CC0 1.0). You can find their license [here](https://github.com/spothq/cryptocurrency-icons/blob/master/LICENSE.md)
