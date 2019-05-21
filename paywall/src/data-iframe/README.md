# The data iframe
The data iframe  is responsible for feeding data to the other components, and responding to queries such
as “does this user have a key?”

## Internal structure

The data iframe is a minimized script that is split into two pieces, a cache handler and blockchain handler.

The main data flow involves sending requests to update the cache from the blockchain. Whenever the cache is
updated, a notification is sent to the main window, which then passes it to any listeners.

Thus, the flow is as follows:

Startup
 |
  -> retrieve cached values
  -> request updates from locksmith and the blockchain
  <- send cached values (if any)
  <- receive blockchain values, store in cache
  <- send updated cached values 

### The cache handler

The cache handler is a tiny script, and is the one that loads first in the main window script. It does these things:
- Check the Cache for
  - saved keys
  - locks
  - transactions
- Listen for the “ready” message from the main script and sends the requested data.
- Loads the larger blockchain communication script that uses unlock-js

### The blockchain handler

The blockchain handler does these things:
- Uses unlock-js web3Service to retrieve data from the chain, specifically locks, keys and transactions.
- Uses unlock-js walletService (with the Web3ProxyProvider) to connect to the web3 proxy in the main window script
- Uses locksmith to quickly retrieve transaction hashes to query based on the user account
- Dispatches messages for saved data
- Caches the saved data for retrieval later by the cache handler
- Listens for the key purchase message, purchases key and monitors the transaction updates, propagating
  them to the main window script
- Monitors key expiry and post a "locked" message to the main window script when all keys have expired

