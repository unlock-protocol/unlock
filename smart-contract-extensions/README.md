# SwapAndCall
Allows users to spend the ERC-20 token type they have, regardless of what the contract they want to interact with expects.

High level steps for a swapAndCall transaction:
 - Collect tokens from the user using transferFrom (if spending tokens instead of ETH)
 - Call one or more contracts (any contract, any method, and params may be included)
 - Send any tokens remaining back to the user

If the user is spending ERC-20 tokens, they need to `approve` the `tokenSpender` address

Mainnet:
 - SwapAndCall: [0x6992..bf93](https://etherscan.io/address/0x6992e0a2bdfbeec40cd2fc8456ae697b5710bf93)
 - TokenSpender: [0x3b97..b812](https://etherscan.io/address/0x3b9735d3f97d6a569de1ac00a2d9b0ecd962b812)
