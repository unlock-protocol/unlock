# Startup and synchronization

This folder contains the glue code that links the blockchain handler and the cache handler to the post office.
The primary flow is to use a cache listener to send updates to the main window. The blockchain handler
indirectly triggers these updates by saving its values to the cache, thus the cache is the single
source of truth for all data passed to the main window.

Transitive events `error` and `walletModal` are not stored in the cache and are relayed directly to the main window.

## syncToCache.js

This is the file that handles listening for blockchain events. It stores the raw results in the cache. Thus,
keys, locks, and transactions are stored as-is. Linking together for the final stage happens in
`../postOffice.js`

## makeSetConfig.js

The method signature for `setConfig` only passes the configuration. In the data iframe, we use the configuration
only to retrieve the list of locks. Once we have this list, we can trigger the flow of data back to the main window.
First, we send the current cached values for `account` and its `balance`, the `network` the user was last seen on,
and the `locks` along with their links keys and transactions. Next, we trigger the retrieval of current information
from the blockchain using the blockchain handler. This uses `connectToBlockchain` to set up the actual communication.

## connectToBlockchain.js

This file implements the code splitting that allows us to load the cache very quickly. It begins by loading the
blockchain handler and the `Web3ProxyProvider` we will use to proxy all web3 calls from the data iframe to the
main window. Once these scripts are loaded, it sets up `walletService` and `web3Service`, and then initializes the
key purchase functionality and starts polling for changes to the user account. Lastly, it retrieves the current
version of the locks, and the keys and transactions for the current user.

This file also contains the `purchaseKey` function used to buy keys for locks. The function is always available,
as it uses a promise and a quick poll to wait for the purchasing functionality to be ready.

## makePurchaseCallback.js

The method signature for `purchaseKey` accepts 2 values: lock address, and any extra tip to add on to the key price
for the lock. As such, in order to successfully purchase a key and monitor the transaction status, we need to close
over a few variables. The `makePurchaseCallback` function does this. Note that at this time, because big number
math is needed to add the tip to the key price, `extraTip` is a noop. Once `walletService` implements this, it
will be added.