import { blockHandler } from "../../src/handler/block";

let blockNumber = 42;
let blockDetails = { transactions: [1, 2, 3] };
let provider = {
  getBlock: jest.fn().mockResolvedValue(blockDetails)
};

let storage = { storeBlock: jest.fn() };
let emitter = { emit: jest.fn() };

describe("blockHandler", () => {
  it("stores the block information", async () => {
    await blockHandler(storage, blockNumber, emitter, provider);
    expect(storage.storeBlock).toHaveBeenCalled();
  });

  it("requests block details from the chain", async () => {
    await blockHandler(storage, blockNumber, emitter, provider);
    expect(provider.getBlock).toHaveBeenCalledWith(blockNumber);
  });

  it("emits an event for each block transaction", async () => {
    await blockHandler(storage, blockNumber, emitter, provider);
    expect(emitter.emit).toHaveBeenCalled();
  });
});
