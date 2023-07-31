# ILockKeyPurchaseHook





Functions to be implemented by a keyPurchaseHook.

*Lock hooks are configured by calling `setEventHooks` on the lock.*

## Methods

### keyPurchasePrice

```solidity
function keyPurchasePrice(address from, address recipient, address referrer, bytes data) external view returns (uint256 minKeyPrice)
```

Used to determine the purchase price before issueing a transaction. This allows the hook to offer a discount on purchases. This may revert to prevent a purchase.

*the lock&#39;s address is the `msg.sender` when this function is called via the lock&#39;s `purchasePriceFor` function*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | the msg.sender making the purchase |
| recipient | address | the account which will be granted a key |
| referrer | address | the account which referred this key sale |
| data | bytes | arbitrary data populated by the front-end which initiated the sale |

#### Returns

| Name | Type | Description |
|---|---|---|
| minKeyPrice | uint256 | the minimum value/price required to purchase a key with these settings |

### onKeyPurchase

```solidity
function onKeyPurchase(address from, address recipient, address referrer, bytes data, uint256 minKeyPrice, uint256 pricePaid) external nonpayable
```

If the lock owner has registered an implementer then this hook is called with every key sold.

*the lock&#39;s address is the `msg.sender` when this function is called*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | the msg.sender making the purchase |
| recipient | address | the account which will be granted a key |
| referrer | address | the account which referred this key sale |
| data | bytes | arbitrary data populated by the front-end which initiated the sale |
| minKeyPrice | uint256 | the price including any discount granted from calling this hook&#39;s `keyPurchasePrice` function |
| pricePaid | uint256 | the value/pricePaid included with the purchase transaction |




