import { Lock, KeyHolder, Key } from "../generated/schema";
import {
  Transfer,
  OwnershipTransferred,
  PriceChanged
} from "../generated/templates/PublicLock/PublicLock";
import { Address } from "@graphprotocol/graph-ts";

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
  let lockAddress = event.address;
  let lock = Lock.load(lockAddress.toHex());
  let zeroAddress = "0x0000000000000000000000000000000000000000";

  let keyID = event.address
    .toHex()
    .concat("-")
    .concat(event.params._tokenId.toString());

  if (event.params._from.toHex() == zeroAddress) {
    newlyMintedKey(lock as Lock, event);
    let key = new Key(keyID);
    key.lock = event.address.toHex();
    key.keyId = event.params._tokenId;
    key.owner = event.params._to.toHex();
    key.save();
  } else {
    let keyHolder = loadKeyHolder(event.params._to.toHex());
    keyHolder.save();

    let key = Key.load(keyID);
    key.owner = event.params._to.toHex();
    key.save();
  }
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

function newlyMintedKey(lock: Lock, event: Transfer): void {
  let keyHolder = loadKeyHolder(event.params._to.toHex());
  keyHolder.save();
}
