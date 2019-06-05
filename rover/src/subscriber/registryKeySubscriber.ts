import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent
} from "typeorm";
import { RegistryKey } from "../entity/RegistryKey";
import RoverEmitter from "../roverEmitter";
import Backfiller from "../backfill";

@EventSubscriber()
export default class RegistrySubscriber implements EntitySubscriberInterface {
  roverEmitter: RoverEmitter;
  address: any;

  listenTo() {
    return RegistryKey;
  }

  afterInsert(event: InsertEvent<RegistryKey>) {
    this.roverEmitter = new RoverEmitter();
    this.roverEmitter.emit("registration", event.entity);

    let backfill = new Backfiller(this.roverEmitter);
    backfill.backfill(event.entity.address)
  }
}
