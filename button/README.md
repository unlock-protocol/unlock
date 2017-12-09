# Button

The button is a JS snippet which erases the content of the page based on the status of the current visitor. Visitor has unlocked? Keep copntent. Visited has not unlocked, hide/erase content and yield to the iframe so that the user can unlock the content.

This snippet is expected to change very rarely so it can (and should!) be cached very aggressively to provide a good user experience (no flickering).

The page on which the button is embedded needs to have a single element with the following data attributes 
* `unlock-address`: ethereum address to which the user needs to send a transaction.
* `unlock-symbol`: the currency in which the user needs to be pay
* `unlock-amount`: the decimal amount required to unlock the payment

Once it is embedded on a page, it should load an iframe from the main unlock website. This iframe is transparent and covers the whole page. 
The button then listens to the iframe via `postMessage` to eventually remove itself when the content has been unlocked.

