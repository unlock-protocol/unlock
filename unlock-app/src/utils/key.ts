const MAX_TRANSFER_FEE = 10000 //100% of transfer fees = disabled transfers

export const isKeyTransferable = (transferFee: number) => {
  return transferFee !== MAX_TRANSFER_FEE
}
