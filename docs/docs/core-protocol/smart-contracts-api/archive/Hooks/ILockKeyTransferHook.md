# ILockKeyTransferHook

Functions to be implemented by a hasValidKey Hook.

_Lock hooks are configured by calling `setEventHooks` on the lock._

## Methods

### onKeyTransfer

```solidity
function onKeyTransfer(address lockAddress, uint256 tokenId, address operator, address from, address to, uint256 expirationTimestamp) external nonpayable
```

If the lock owner has registered an implementer then this hook is called every time balanceOf is called

#### Parameters

| Name                | Type    | Description                                   |
| ------------------- | ------- | --------------------------------------------- |
| lockAddress         | address | the address of the current lock               |
| tokenId             | uint256 | the Id of the transferred key                 |
| operator            | address | who initiated the transfer                    |
| from                | address | the previous owner of transferred key         |
| to                  | address | the new owner of the key                      |
| expirationTimestamp | uint256 | the key expiration timestamp (after transfer) |
