import { Bytes } from "@graphprotocol/graph-ts";

export function removeItemFromArray(
  collection: Bytes[],
  item: Bytes
): Bytes[] {
  let tempArray: Bytes[] = [];

  for (let i = 0; i < collection.length; i++) {
    let currentItem = <Bytes>collection[i];

    if (currentItem != item) {
      tempArray.push(currentItem);
    }
  }

  return tempArray;
}

export function addItemToArray(collection: Bytes[], item: Bytes): Bytes[] {
  if (collection) {
    let temp = collection;
    temp.push(item);
    return temp;
  } else {
    return [item];
  }
}
