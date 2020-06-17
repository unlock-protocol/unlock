import { BigInt } from "@graphprotocol/graph-ts";
import {
  NewLock,
  NewTokenURI,
  NewGlobalTokenSymbol,
  OwnershipTransferred,
  CreateLockCall
} from "../generated/Contract/Contract";
import { UnlockEntity } from "../generated/schema";
import { processNewLock } from "./lockProcessing";

export function handleNewLock(event: NewLock): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entityId = event.transaction.hash.toHex();
  let entity = UnlockEntity.load(entityId);

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new UnlockEntity(entityId);
    entity.count = BigInt.fromI32(0);
  }

  entity.count = entity.count + BigInt.fromI32(1);
  entity.lockOwner = event.params.lockOwner;
  entity.newLockAddress = event.params.newLockAddress;
  entity.save();

  processNewLock(event);
}

export function handleNewTokenURI(event: NewTokenURI): void {}
export function handleNewGlobalTokenSymbol(event: NewGlobalTokenSymbol): void {}
export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
export function handleCreateLock(call: CreateLockCall): void {
  let entityId = call.transaction.hash.toHex();
  let entity = UnlockEntity.load(entityId);

  if (entity == null) {
    entity = new UnlockEntity(entityId);
  }

  let tokenAddress = call.inputs._tokenAddress.toHex();
  entity.save();
}
