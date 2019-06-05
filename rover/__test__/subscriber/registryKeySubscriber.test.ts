import RegistrySubscriber from "../../src/subscriber/registryKeySubscriber";

let backfiller = { backfill: jest.fn() };
let emitter = { emit: jest.fn() };
let address = "0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2";

jest.mock("../../src/backfill", () => {
  return {
    default: jest.fn().mockImplementation(() => backfiller)
  };
});

jest.mock("../../src/roverEmitter", () => {
  return {
    default: jest.fn().mockImplementation(() => emitter)
  };
});

describe("RegistrySubscriber", () => {
  describe("afterInsert", () => {
    it("emits an event of the registration event", () => {
      expect.assertions(1);
      let event = {
        metadata: null,
        manager: null,
        connection: null,
        queryRunner: null,
        entity: {
          address
        }
      };

      let registrySubscriber = new RegistrySubscriber();
      registrySubscriber.afterInsert(event);
      expect(emitter.emit).toBeCalledWith("registration", {
        address: "0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2"
      });
    });

    it("dispatches a backfill", () => {
      expect.assertions(1);
      let event = {
        metadata: null,
        manager: null,
        connection: null,
        queryRunner: null,
        entity: {
          address
        }
      };

      let registrySubscriber = new RegistrySubscriber();
      registrySubscriber.afterInsert(event);
      expect(backfiller.backfill).toBeCalledWith(address);
    });
  });
});
