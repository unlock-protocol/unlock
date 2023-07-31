# ILockKeyCancelHook





Functions to be implemented by a keyCancelHook.

*Lock hooks are configured by calling `setEventHooks` on the lock.*

## Methods

### onKeyCancel

```solidity
function onKeyCancel(address operator, address to, uint256 refund) external nonpayable
```

If the lock owner has registered an implementer then this hook is called with every key cancel.



#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | the msg.sender issuing the cancel |
| to | address | the account which had the key canceled |
| refund | uint256 | the amount sent to the `to` account (ETH or a ERC-20 token) |




