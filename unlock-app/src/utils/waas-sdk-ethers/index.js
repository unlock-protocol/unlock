import { ethers, Transaction, JsonRpcSigner } from 'ethers'
export class WaasEthersSigner extends JsonRpcSigner {
  waasAddress
  constructor(address, provider) {
    super(provider, address.address)
    this.waasAddress = address
  }
  connect(provider) {
    return new WaasEthersSigner(this.waasAddress, provider)
  }
  async getAddress() {
    return this.waasAddress.address
  }
  async signTransaction(transaction) {
    const tx = await ethers.resolveProperties(transaction)
    const baseTx = {
      chainId: tx.chainId || undefined,
      data: tx.data || undefined,
      gasLimit: tx.gasLimit || undefined,
      gasPrice: tx.gasPrice || undefined,
      nonce: tx.nonce ? BigInt(tx.nonce) : undefined,
      to: tx.to || undefined,
      value: tx.value || undefined,
    }
    const serializedTx = Transaction.from(baseTx).serialized
    let res
    try {
      const hashToSign = ethers.keccak256(serializedTx)
      res = await this.waasAddress.sign(hashToSign.slice(2))
    } catch (exc) {
      throw new Error('MPC Engine failed to sign.', { cause: exc })
    }
    return Transaction.from(baseTx, {
      v: BigInt('0x' + res.v),
      r: '0x' + res.r,
      s: '0x' + res.s,
    }).serialized
  }
  async signMessage(message) {
    const hashToSign = ethers.hashMessage(message).slice(2)
    let res
    try {
      res = await this.waasAddress.sign(hashToSign)
    } catch (exc) {
      throw new Error('MPC Engine failed to sign.', { cause: exc })
    }
    const recoveryCode = res.v
    const v = BigInt(recoveryCode) + 27n
    const hexSignature = `0x${res.r}${res.s}${v}`
    return hexSignature
  }
  async signTypedData(domain, types, value) {
    const hashToSign = ethers.TypedDataEncoder.hash(domain, types, value).slice(
      2
    )
    let res
    try {
      res = await this.waasAddress.sign(hashToSign)
    } catch (exc) {
      throw new Error('MPC Engine failed to sign.', { cause: exc })
    }
    const recoveryCode = res.v
    const v = BigInt(recoveryCode) + 27n
    const hexSignature = `0x${res.r}${res.s}${v}`
    return hexSignature
  }
}
