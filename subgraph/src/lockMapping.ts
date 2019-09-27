import { Lock, KeyHolder, Key, KeyPurchase } from "../generated/schema";
import {
  Transfer,
  OwnershipTransferred,
  PriceChanged,
  PublicLock
} from "../generated/templates/PublicLock/PublicLock";
import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts";
import { CancelKey, ExpireKey } from "../generated/Contract/PublicLock";

export function handleLockTransfer(event: OwnershipTransferred): void {
  let lock = Lock.load(event.address.toHex());
  lock.owner = event.params.newOwner;
  lock.save();
}

export function handlePriceChanged(event: PriceChanged): void {
  let lockAddress = event.address.toHex();
  let lock = Lock.load(lockAddress);
  lock.price = event.params.keyPrice;
  lock.save();
}

export function handleTransfer(event: Transfer): void {
  let lock = Lock.load(event.address.toHex()) as Lock;
  let zeroAddress = "0x0000000000000000000000000000000000000000";
  let lockContract = PublicLock.bind(event.address);

  if (event.params._from.toHex() == zeroAddress) {
    newKeyPurchase(event, lock, lockContract);
  } else {
    existingKeyTransfer(event);
  }
}

function existingKeyTransfer(event: Transfer): void {
  let lockContract = PublicLock.bind(event.address);
  let keyID = genKeyID(event.address, event.params._tokenId.toString());
  let key = Key.load(keyID);

  let keyHolder = loadKeyHolder(event.params._to.toHex());
  keyHolder.save();

  key.owner = event.params._to.toHex();
  key.expiration = lockContract.keyExpirationTimestampFor(event.params._to);
  key.save();
}

function newKeyPurchase(
  event: Transfer,
  lock: Lock,
  lockContract: PublicLock
): void {
  let keyID = genKeyID(event.address, event.params._tokenId.toString());
  let keyPurchaseID = keyID + "-" + event.block.number.toString()

  genKey(event, lock, lockContract);
  genKeyPurchase(
    keyPurchaseID,
    event.params._to,
    event.address,
    event.block.timestamp,
    lockContract.tokenAddress(),
    lockContract.keyPrice()
  );
}

export function handleCancelKey(event: CancelKey): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString());
  let key = Key.load(keyID);
  let lockContract = PublicLock.bind(event.address);
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.owner);
  key.save();
}

export function handleExpireKey(event: ExpireKey): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString());
  let key = Key.load(keyID);
  let lockContract = PublicLock.bind(event.address);
  key.expiration = lockContract.keyExpirationTimestampFor(
    Address.fromString(key.owner)
  );
  key.save();
}

function genKey(event: Transfer, lock: Lock, lockContract: PublicLock): void {
  let keyID = genKeyID(event.address, event.params._tokenId.toString());

  newlyMintedKey(event);
  let key = new Key(keyID);
  key.lock = event.address.toHex();
  key.keyId = event.params._tokenId;
  key.owner = event.params._to.toHex();
  key.expiration = lockContract.keyExpirationTimestampFor(event.params._to);
  key.save();
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

function genKeyID(lockAddress: Address, tokenId: string): string {
  return lockAddress
    .toHex()
    .concat("-")
    .concat(tokenId);
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

function newlyMintedKey(event: Transfer): void {
  let keyHolder = loadKeyHolder(event.params._to.toHex());
  keyHolder.save();
}
