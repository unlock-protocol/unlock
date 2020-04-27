import { Address, Bytes, BigInt, store } from "@graphprotocol/graph-ts";
import { Lock, LockManager, KeyHolder, Key, KeyPurchase } from "../../generated/schema";
import {
  ExpireKey,
  CancelKey,
  ExpirationChanged,
  LockManagerAdded,
  LockManagerRemoved,
  PricingChanged,
  Transfer,
  PublicLock,
  Disable
} from "../../generated/templates/PublicLock7/PublicLock";

export function cancelKey(event: CancelKey): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString());
  let key = Key.load(keyID);
  let lockContract = PublicLock.bind(event.address);
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.owner);
  key.save();
}

export function expirationChanged(event: ExpirationChanged): void {
  let keyID = genKeyID(event.address, event.params._tokenId.toString());
  let key = Key.load(keyID);
  let lockContract = PublicLock.bind(event.address);
  let lockOwner = lockContract.ownerOf(event.params._tokenId);
  let currentExpiration = lockContract.keyExpirationTimestampFor(lockOwner);

  let timeDelta = event.params._amount;

  if (event.params._timeAdded) {
    key.expiration = currentExpiration.plus(timeDelta);
  } else {
    key.expiration = currentExpiration.minus(timeDelta);
  }

  key.save();
}

export function expireKey(event: ExpireKey): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString());
  let key = Key.load(keyID);

  key.expiration = event.block.timestamp;

  key.save();
}

export function lockManagerAdded(event: LockManagerAdded): void {
  let lockAddress = event.address.toHex();
  let manager = event.params.account.toHex();

  let lockManager = new LockManager(lockAddress.concat(manager));
  lockManager.lock = lockAddress;
  lockManager.address = event.params.account;
  lockManager.save();
}

export function lockManagerRemoved(event: LockManagerRemoved): void {
  let lockAddress = event.address.toHex();
  let manager = event.params.account.toHex();

  let lockManager = new LockManager(lockAddress.concat(manager));
  lockManager.lock = Address.fromI32(0).toHex();  
  lockManager.save();
}

export function pricingChanged(event: PricingChanged): void {
  let lockAddress = event.address.toHex();
  let lock = Lock.load(lockAddress);
  lock.price = event.params.keyPrice;
  lock.tokenAddress = event.params.tokenAddress;
  lock.save();
}

export function transfer(event: Transfer): void {
  let lock = Lock.load(event.address.toHex()) as Lock;
  let zeroAddress = "0x0000000000000000000000000000000000000000";
  let lockContract = PublicLock.bind(event.address);

  if (event.params.from.toHex() == zeroAddress) {
    newKeyPurchase(event, lock, lockContract);
  } else {
    existingKeyTransfer(event);
  }
}

export function handleDisable(event: Disable): void {  
  let lockId = event.address.toHex().toString();
  let lock = Lock.load(lockId) as Lock;

  lock.LockManagers.forEach((lockManager) =>{
    let lockManagerId = event.address.toHex().toString().concat(lockManager) as string;    
    store.remove('LockManager', lockManagerId);
  })

  store.remove('Lock', lockId);
}

function newKeyPurchase(
  event: Transfer,
  lock: Lock,
  lockContract: PublicLock
): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString());
  let keyPurchaseID = keyID + "-" + event.block.number.toString();

  genKey(event, lockContract);

  let tokenAddress = lockContract.try_tokenAddress();

  if (!tokenAddress.reverted) {
    lock.tokenAddress = tokenAddress.value;
  } else {
    lock.tokenAddress = Address.fromString(
      "0000000000000000000000000000000000000000"
    );
  }

  genKeyPurchase(
    keyPurchaseID,
    event.params.to,
    event.address,
    event.block.timestamp,
    lock.tokenAddress as Bytes,
    lockContract.keyPrice()
  );
}

function genKeyPurchase(
  keyID: string,
  purchaser: Bytes,
  lock: Bytes,
  timestamp: BigInt,
  tokenAddress: Bytes,
  price: BigInt
): void {
  let keyPurchase = new KeyPurchase(keyID);
  keyPurchase.purchaser = purchaser;
  keyPurchase.lock = lock;
  keyPurchase.timestamp = timestamp;
  keyPurchase.tokenAddress = tokenAddress;
  keyPurchase.price = price;
  keyPurchase.save();
}

function newlyMintedKey(event: Transfer): void {
  let keyHolder = loadKeyHolder(event.params.to.toHex());
  keyHolder.save();
}

function genKey(event: Transfer, lockContract: PublicLock): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString());

  newlyMintedKey(event);
  let key = new Key(keyID);
  key.lock = event.address.toHex();
  key.keyId = event.params.tokenId;
  key.owner = event.params.to.toHex();
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.to);
  key.tokenURI = lockContract.tokenURI(key.keyId);
  key.createdAt = event.block.timestamp;

  let lock = Lock.load(key.lock);

  if (lock.version > BigInt.fromI32(0)) {
    let tokenURI = lockContract.try_tokenURI(key.keyId);

    if (!tokenURI.reverted) {
      key.tokenURI = lockContract.tokenURI(key.keyId);
    }
  }

  key.save();
}

function existingKeyTransfer(event: Transfer): void {
  let lockContract = PublicLock.bind(event.address);
  let keyID = genKeyID(event.address, event.params.tokenId.toString());
  let key = Key.load(keyID);

  let keyHolder = loadKeyHolder(event.params.to.toHex());
  keyHolder.save();

  key.owner = event.params.to.toHex();
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.to);
  key.save();
}

function loadKeyHolder(id: string): KeyHolder {
  let keyHolder = KeyHolder.load(id);

  if (keyHolder != null) {
    return keyHolder as KeyHolder;
  } else {
    let keyHolder = new KeyHolder(id);
    keyHolder.address = Address.fromString(id);
    return keyHolder;
  }
}

function genKeyID(lockAddress: Address, tokenId: string): string {
  return lockAddress
    .toHex()
    .concat("-")
    .concat(tokenId);
}
