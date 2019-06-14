import Backfiller from "../src/backfill";
const EventEmitter = require('events');

jest.mock("ethers", () => {
  return {
    ethers: {
      providers: {
        EtherscanProvider: jest.fn(() => {
          return { getHistory: jest.fn().mockResolvedValue([{ hash: 123 }]) };
        })
      }
    }
  };
});

describe("Backfiller", () => {
  describe("backfill", () => {
    it("requests the entity's transaction history", () => {
        expect.assertions(1)
      var emitter = new EventEmitter;

      let backfiller = new Backfiller('network_id', emitter);
      backfiller.backfill("0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2");

      emitter.on('transaction', hash => {
          expect(hash).toEqual(123)
      })
    });
  });
});
