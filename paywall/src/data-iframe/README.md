# The data iframe

In the data iframe, there are 2 main components

- cache handler
- blockchain handler

The primary script for the data iframe manages messages posted between the main window script.

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